"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DesignProvider, useDesign } from "../design-system/provider";
import { translations, Locale } from "@aifoundry/shared";
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
    title: "Buste Royal Dahomey en Bronze",
    subtitle: "Bronze noble · Cire perdue d'Abomey",
    category: "digital",
    price: 195000,
    currency: "XOF",
    rating: 5.0,
    reviewsCount: 89,
    seller: {
      name: "Fonderie Royale d'Abomey",
      city: "Abomey",
      verified: true,
      rating: 5.0,
      salesCount: 140,
      initials: "FA",
    },
    image: "/products/art-bronze.jpg",
    description:
      "Sculpture royale en bronze massif patiné à l'or et à la cire perdue, issue des ateliers de fonte ancestraux du plateau d'Abomey.",
    stock: 2,
    variants: [
      { name: "Bronze Doré Patiné", color: "#B8860B" },
      { name: "Bronze Noir Antique", color: "#2B241F" },
    ],
  },
  {
    id: "prod-5",
    title: "Bague Sculpturale Or 18K & Émeraude",
    subtitle: "Or jaune 18K · Émeraude ovale",
    category: "fashion",
    price: 320000,
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
    image: "/products/jewelry-gold.jpg",
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

export interface AuthSessionUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  shopName?: string;
  shopInitials?: string;
}

const DEMO_BUYER_USER: AuthSessionUser = {
  id: "usr-buyer-01",
  name: "Amina Diop",
  phone: "+229 97 00 00 01",
  email: "amina.diop@client.bj",
  role: "BUYER",
};

const DEMO_SELLER_USER: AuthSessionUser = {
  id: "usr-seller-01",
  name: "Alexandre Laurent",
  phone: "+229 90 00 00 02",
  email: "alexandre@maisonlaurent.bj",
  role: "SELLER",
  shopName: "Maison Laurent",
  shopInitials: "ML",
};

const DEMO_ADMIN_USER: AuthSessionUser = {
  id: "usr-admin-01",
  name: "Superviseur Plateforme",
  phone: "+229 90 00 00 00",
  email: "admin@ojarket.bj",
  role: "ADMIN",
};

function MainMarketplaceView() {
  const { locale, setLocale, theme, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = theme === "dark";
  const t = translations[(locale as Locale) || "fr"];

  // Authentication & Gating state
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sellerGateModalOpen, setSellerGateModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Auth form state
  const [authRoleTab, setAuthRoleTab] = useState<"BUYER" | "SELLER" | "ADMIN">("BUYER");
  const [authIdentifier, setAuthIdentifier] = useState("+229 97 00 00 01");
  const [authOtp, setAuthOtp] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [universe, setUniverse] = useState<"buyer" | "seller">("buyer");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [needModalOpen, setNeedModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [sellerTab, setSellerTab] = useState<"overview" | "opportunities" | "orders" | "cashbook">("overview");
  const [needDesc, setNeedDesc] = useState("");
  const [needBudget, setNeedBudget] = useState("");
  const [needPlace, setNeedPlace] = useState("");
  const [needCategory, setNeedCategory] = useState("leather");
  const [needSubmitted, setNeedSubmitted] = useState(false);
  const [aiStructuring, setAiStructuring] = useState(false);

  // Load session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ojarket_web_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleLogin = (user: AuthSessionUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("ojarket_web_user", JSON.stringify(user));
    } catch {}
    setAuthModalOpen(false);
    setSellerGateModalOpen(false);
    setAuthError("");
    setAuthStep("phone");
    if (user.role === "SELLER") {
      setUniverse("seller");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("ojarket_web_user");
    } catch {}
    setUserMenuOpen(false);
    setUniverse("buyer");
  };

  const handleSelectUniverse = (target: "buyer" | "seller") => {
    if (target === "buyer") {
      setUniverse("buyer");
    } else {
      // Check if user is authenticated as seller or admin
      if (currentUser && (currentUser.role === "SELLER" || currentUser.role === "ADMIN")) {
        setUniverse("seller");
      } else {
        setSellerGateModalOpen(true);
      }
    }
  };

  // D02 Buyer proposals & comparison modal state
  const [buyerRequestsModalOpen, setBuyerRequestsModalOpen] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);

  // D02 Seller Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<any>(null);
  const [quotePrice, setQuotePrice] = useState("270000");
  const [quoteAdvance, setQuoteAdvance] = useState("100000");
  const [quoteDays, setQuoteDays] = useState("10");
  const [quoteNotes, setQuoteNotes] = useState("Bronze noble poli, ébauche sous 4 jours, livraison soignée.");
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState("");

  // FinOps Manual Collection modal state
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [collectLabel, setCollectLabel] = useState("Acompte commande sur-mesure bronze");
  const [collectAmount, setCollectAmount] = useState("100000");
  const [collectChannel, setCollectChannel] = useState("MTN MoMo");
  const [collectRef, setCollectRef] = useState("TXN-MOMO-9912");

  // FinOps Daily Close modal state
  const [dailyCloseModalOpen, setDailyCloseModalOpen] = useState(false);
  const [physicalCashInput, setPhysicalCashInput] = useState("850000");
  const [closeNotesInput, setCloseNotesInput] = useState("Caisse conforme, inventaire vérifié");
  const [closureSuccess, setClosureSuccess] = useState(false);

  // Dynamic D02 Requests state
  const [requestsList, setRequestsList] = useState([
    {
      id: "req-01",
      buyerName: "Amina Diop",
      buyerCity: "Cotonou",
      title: "Parure royale en bronze ciselé pour cérémonie traditionnelle",
      description: "Recherche d'un atelier d'artisan d'Abomey capable de forger un collier plastron et manchettes assorties sous 15 jours avec symboles royaux.",
      category: "Joaillerie & Bronze",
      budget: "280 000 FCFA",
      proposalsCount: 2,
      proposals: [
        {
          id: "prop-01",
          artisan: "Fonderie Royale d'Abomey",
          city: "Abomey",
          price: 275000,
          advance: 100000,
          days: 12,
          notes: "Faisable sous 12 jours. Ébauche envoyée par WhatsApp après confirmation du versement direct MoMo.",
          status: "PENDING",
        },
        {
          id: "prop-02",
          artisan: "Ateliers d'Honneur",
          city: "Cotonou",
          price: 290000,
          advance: 120000,
          days: 10,
          notes: "Finition bronze patiné noble, garniture intérieure velours noir.",
          status: "PENDING",
        },
      ],
    },
    {
      id: "req-02",
      buyerName: "Marcelle Houngbo",
      buyerCity: "Porto-Novo",
      title: "Table console sculptée en bois d'Iroko massif",
      description: "Console d'entrée 140cm x 40cm avec pieds sculptés motifs bas-reliefs dahoméens. Finition cirée naturelle.",
      category: "Mobilier d'Art",
      budget: "450 000 FCFA",
      proposalsCount: 1,
      proposals: [
        {
          id: "prop-03",
          artisan: "Studio Bois Sacré",
          city: "Porto-Novo",
          price: 430000,
          advance: 200000,
          days: 21,
          notes: "Bois d'Iroko séché 3 ans. Sculptures réalisées par maître ébéniste.",
          status: "PENDING",
        }
      ],
    },
    {
      id: "req-03",
      buyerName: "Didier Agossa",
      buyerCity: "Parakou",
      title: "Sac de voyage weekend en cuir pleine fleur patiné",
      description: "Sac de voyage 50L en cuir brun foncé avec compartiment chaussures et bandoulière renforcée.",
      category: "Maroquinerie",
      budget: "190 000 FCFA",
      proposalsCount: 0,
      proposals: [],
    }
  ]);

  // Dynamic FinOps Entries state
  const [finopsEntries, setFinopsEntries] = useState([
    { id: "fin-01", type: "ENCAISSEMENT", label: "Commande OJK-2026-0891 (Sac Cabas Grand Marché)", channel: "MTN MoMo", amount: 185000, reference: "TXN-MTN-89021", time: "14:32", status: "Confirmé par PSP" },
    { id: "fin-02", type: "ENCAISSEMENT", label: "Vente directe comptoir — Porte-carte cuir cognac", channel: "Espèces", amount: 45000, reference: "REC-CPT-004", time: "11:15", status: "Confirmé par vendeur" },
    { id: "fin-03", type: "VENTE_A_CREDIT", label: "Commande Galerie Royale — Solde à livraison", channel: "Virement", amount: 120000, reference: "CMD-GAL-990", time: "09:10", status: "Créance en attente" },
  ]);

  const [finopsKpis, setFinopsKpis] = useState({
    vendu: 1280000,
    encaisse: 850000,
    restant: 430000,
  });


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
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: "/products/watch-chrono.jpg", isAll: false },
    { id: "leather", label: isEn ? "Bags" : "Maroquinerie", image: "/products/leather-tote.jpg", isAll: false },
    { id: "fashion", label: isEn ? "Jewelry" : "Bijoux d'Art", image: "/products/jewelry-gold.jpg", isAll: false },
    { id: "home", label: isEn ? "Home" : "Mobilier d'Art", image: "/products/armchair.jpg", isAll: false },
    { id: "digital", label: isEn ? "Sculptures" : "Art & Bronze", image: "/products/art-bronze.jpg", isAll: false },
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
                onClick={() => handleSelectUniverse("buyer")}
              >
                {t.nav.buyerUniverse}
              </button>
              <button
                className={`oj-pill-opt ${universe === "seller" ? "active" : ""}`}
                onClick={() => handleSelectUniverse("seller")}
              >
                {t.nav.sellerUniverse}
              </button>
              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="oj-pill-opt"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 700,
                    color: "var(--oj-color-accent)",
                  }}
                >
                  <span>👑</span> {t.nav.admin}
                </Link>
              )}
            </div>

            <button
              className="oj-icon-btn"
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              title={t.nav.langToggle}
              style={{ fontWeight: 700, fontSize: "13px" }}
            >
              {locale.toUpperCase()}
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

            {/* User Account / Auth Gate Control */}
            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  className="oj-btn-secondary"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "var(--oj-radius-pill)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderColor: currentUser.role === "ADMIN" ? "var(--oj-color-accent)" : "var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-surface)",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "11px",
                      backgroundColor: currentUser.role === "ADMIN" ? "var(--oj-color-accent)" : "var(--oj-color-action)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {currentUser.role === "ADMIN" ? "👑" : currentUser.shopInitials || currentUser.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--oj-color-muted)" }}>▼</span>
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "44px",
                      right: 0,
                      width: "230px",
                      backgroundColor: "var(--oj-color-surface)",
                      borderRadius: "var(--oj-radius-card)",
                      border: "1px solid var(--oj-color-border)",
                      boxShadow: "var(--oj-shadow-lg)",
                      padding: "14px",
                      zIndex: 200,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ paddingBottom: "8px", borderBottom: "1px solid var(--oj-color-border)" }}>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--oj-color-text)" }}>{currentUser.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--oj-color-accent)", fontWeight: 600, marginTop: "2px" }}>
                        {currentUser.role === "ADMIN"
                          ? "👑 Super Administrateur"
                          : currentUser.role === "SELLER"
                          ? `👑 Maître Artisan · ${currentUser.shopName || "Atelier"}`
                          : "✦ Client Privilège"}
                      </div>
                    </div>

                    {currentUser.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--oj-color-accent)",
                          fontWeight: 700,
                          fontSize: "12px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(212, 180, 131, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        👑 Panel Administration →
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleSelectUniverse(universe === "buyer" ? "seller" : "buyer");
                        setUserMenuOpen(false);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "var(--oj-color-text)",
                        borderRadius: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {universe === "buyer" ? "Basculer vers Atelier Vendeur ↗" : "Basculer vers Espace Découverte ↗"}
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "var(--oj-color-errorFg)",
                        borderRadius: "6px",
                        borderTop: "1px solid var(--oj-color-border)",
                        paddingTop: "8px",
                        fontWeight: 600,
                      }}
                    >
                      Se déconnecter ✕
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="oj-btn-secondary"
                onClick={() => setAuthModalOpen(true)}
                style={{
                  height: "38px",
                  padding: "0 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "var(--oj-radius-pill)",
                }}
              >
                {isEn ? "Sign In" : "Se connecter"}
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
                    <span className="oj-cat-icon-circle">
                      {cat.isAll ? (
                        <img
                          src={
                            isDark
                              ? "/brand/Ojarket_01_Icon_UltraPremium_Dark_Transparent.png"
                              : "/brand/Ojarket_01_Icon_UltraPremium_Transparent.png"
                          }
                          alt="Tout"
                          style={{ width: "32px", height: "32px", objectFit: "contain" }}
                        />
                      ) : (
                        <img
                          src={cat.image || ""}
                          alt={cat.label}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </span>
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
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                <button className="oj-btn-primary" onClick={() => setNeedModalOpen(true)}>
                  {t.d02.bannerCta} →
                </button>
                <button
                  className="oj-btn-secondary"
                  onClick={() => setBuyerRequestsModalOpen(true)}
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FAF9F6", borderColor: "rgba(255,255,255,0.3)" }}
                >
                  {locale === "fr" ? "Mes demandes & devis reçus (2) →" : "My requests & quotes received (2) →"}
                </button>
              </div>

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
              {(["overview", "opportunities", "orders", "cashbook"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`oj-seller-tab ${sellerTab === tab ? "active" : ""}`}
                  onClick={() => setSellerTab(tab)}
                >
                  {tab === "overview"
                    ? isEn ? "Dashboard" : "Tableau de bord"
                    : tab === "opportunities"
                    ? isEn ? "Buyer Demands (3)" : "Opportunités D02 (3)"
                    : tab === "orders"
                    ? isEn ? "Orders (14)" : "Commandes (14)"
                    : isEn ? "Cashbook & FinOps" : "Caisse & FinOps"}
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
                    { label: isEn ? "Buyer requests to quote" : "Demandes sur-mesure à chiffrer", count: "03", action: () => setSellerTab("opportunities") },
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

            {sellerTab === "opportunities" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontFamily: "var(--oj-font-editorial)", fontSize: "20px" }}>
                      {t.d02.sellerOpportunities}
                    </h3>
                    <p style={{ margin: 0, color: "var(--oj-color-muted)", fontSize: "13px" }}>
                      {t.d02.sellerOpportunitiesDesc}
                    </p>
                  </div>
                </div>

                {quoteSuccessMsg && (
                  <div style={{ background: "#E6F4EE", color: "#185F46", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                    ✓ {quoteSuccessMsg}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {requestsList.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        background: "var(--oj-color-surface)",
                        border: "1px solid var(--oj-color-border)",
                        borderRadius: "var(--oj-radius-card)",
                        padding: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "280px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <span className="oj-status-pill pending">{req.category}</span>
                          <span style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                            {req.buyerName} · {req.buyerCity}
                          </span>
                        </div>
                        <h4 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 600 }}>{req.title}</h4>
                        <p style={{ margin: "0 0 16px", color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.5" }}>
                          {req.description}
                        </p>
                        <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Target Budget:" : "Budget indicatif :"} </span>
                            <strong style={{ color: "var(--oj-color-action)" }}>{req.budget}</strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Quotes:" : "Devis soumis :"} </span>
                            <strong>{req.proposalsCount}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "180px" }}>
                        <button
                          className="oj-btn-primary"
                          onClick={() => {
                            setSelectedRequestForQuote(req);
                            setQuoteModalOpen(true);
                          }}
                        >
                          {t.d02.submitProposal} →
                        </button>
                      </div>
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
                {/* Triade FinOps */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
                    <div className="oj-kpi-header"><span style={{ fontWeight: 700 }}>{t.finops.vendu}</span></div>
                    <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>{formatPrice(finopsKpis.vendu)}</strong>
                    <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{t.finops.venduSub}</small>
                  </div>
                  <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                    <div className="oj-kpi-header"><span style={{ fontWeight: 700 }}>{t.finops.encaisse}</span></div>
                    <strong className="oj-kpi-value" style={{ color: "#185F46", fontVariantNumeric: "tabular-nums" }}>{formatPrice(finopsKpis.encaisse)}</strong>
                    <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{t.finops.encaisseSub}</small>
                  </div>
                  <div className="oj-kpi-card" style={{ borderLeft: "4px solid #AD8455" }}>
                    <div className="oj-kpi-header"><span style={{ fontWeight: 700 }}>{t.finops.restant}</span></div>
                    <strong className="oj-kpi-value" style={{ color: "#AD8455", fontVariantNumeric: "tabular-nums" }}>{formatPrice(finopsKpis.restant)}</strong>
                    <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{t.finops.restantSub}</small>
                  </div>
                </div>

                {/* Actions FinOps */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
                  <button className="oj-btn-primary" onClick={() => setCollectModalOpen(true)}>
                    + {t.finops.recordCollection}
                  </button>
                  <button className="oj-btn-secondary" onClick={() => setDailyCloseModalOpen(true)}>
                    ✓ {t.finops.dailyClose} (S44)
                  </button>
                </div>

                {closureSuccess && (
                  <div style={{ background: "#E6F4EE", color: "#185F46", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                    ✓ {isEn ? "Daily close registered successfully! Audit ledger updated." : "Clôture de journée enregistrée avec succès ! Grand livre immuable mis à jour."}
                  </div>
                )}

                {/* Journal de Caisse Table */}
                <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "20px", marginBottom: "24px" }}>
                  <h4 style={{ margin: "0 0 16px", fontFamily: "var(--oj-font-editorial)", fontSize: "18px" }}>
                    {t.finops.cashbookTitle}
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--oj-color-border)", color: "var(--oj-color-muted)" }}>
                        <th style={{ textAlign: "left", padding: "10px 0" }}>Libellé & Référence</th>
                        <th style={{ textAlign: "left", padding: "10px 0" }}>Canal</th>
                        <th style={{ textAlign: "left", padding: "10px 0" }}>Heure</th>
                        <th style={{ textAlign: "left", padding: "10px 0" }}>Statut</th>
                        <th style={{ textAlign: "right", padding: "10px 0" }}>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finopsEntries.map((e) => (
                        <tr key={e.id} style={{ borderBottom: "1px solid var(--oj-color-subtle)" }}>
                          <td style={{ padding: "14px 0" }}>
                            <div style={{ fontWeight: 600 }}>{e.label}</div>
                            <small style={{ color: "var(--oj-color-muted)" }}>{e.reference}</small>
                          </td>
                          <td style={{ padding: "14px 0" }}>{e.channel}</td>
                          <td style={{ padding: "14px 0", color: "var(--oj-color-muted)" }}>{e.time}</td>
                          <td style={{ padding: "14px 0" }}>
                            <span className="oj-status-pill success">{e.status}</span>
                          </td>
                          <td style={{ padding: "14px 0", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {formatPrice(e.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grand Livre Immuable (Append-only preview) */}
                <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", fontSize: "12px" }}>
                  <div style={{ fontWeight: 700, marginBottom: "8px", color: "var(--oj-color-action)" }}>
                    🔒 Grand Livre Immuable (Append-Only Events — V3 Architecture)
                  </div>
                  <div style={{ color: "var(--oj-color-muted)", lineHeight: "1.6" }}>
                    Toute écriture de vente ou encaissement génère un événement non supprimable (`PAYMENT_CONFIRMED`, `SALE_CREATED`, `DAY_CLOSED`). Les rectifications se font par contre-passation auditée.
                  </div>
                </div>
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

      {/* ==================== D02 BUYER REQUESTS & PROPOSALS MODAL (S06) ==================== */}
      {buyerRequestsModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setBuyerRequestsModalOpen(false)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "860px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              onClick={() => setBuyerRequestsModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "BESPOKE S06 — COMPARISON & ACCEPTANCE" : "SUR-MESURE S06 — COMPARATEUR DE DEVIS"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "8px 0 8px" }}>
              {isEn ? "My Bespoke Demands & Artisan Proposals" : "Mes Demandes & Devis Artisans Reçus"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: "0 0 24px" }}>
              {isEn
                ? "Compare proposals received from verified ateliers. Choose the best offer to convert it into a confirmed workshop order."
                : "Comparez les devis détaillés soumis par nos ateliers vérifiés. Sélectionnez la meilleure offre pour la convertir en commande atelier."}
            </p>

            {proposalAccepted && (
              <div style={{ background: "#E6F4EE", color: "#185F46", padding: "16px 20px", borderRadius: "10px", marginBottom: "24px", border: "1px solid #63DBB6" }}>
                <strong>✓ {isEn ? "Proposal Accepted!" : "Devis accepté avec succès !"}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  {isEn
                    ? "Workshop order OJK-SURMESURE-8921 created. The artisan has been notified to start crafting upon receipt of direct deposit via Mobile Money."
                    : "Commande atelier n° OJK-SURMESURE-8921 créée. L'atelier a été notifié pour amorcer la confection dès versement direct de l'acompte."}
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {requestsList.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: "1px solid var(--oj-color-border)",
                    borderRadius: "var(--oj-radius-card)",
                    padding: "20px",
                    background: "var(--oj-color-surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span className="oj-status-pill success" style={{ fontSize: "11px", marginBottom: "6px", display: "inline-block" }}>
                        {req.category}
                      </span>
                      <h3 style={{ margin: "4px 0", fontSize: "18px", fontFamily: "var(--oj-font-editorial)" }}>
                        {req.title}
                      </h3>
                      <small style={{ color: "var(--oj-color-muted)" }}>
                        {req.buyerName} · {req.buyerCity} · {isEn ? "Budget:" : "Budget indicatif :"} <strong>{req.budget}</strong>
                      </small>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--oj-color-action)" }}>
                      {req.proposals.length} {isEn ? "proposals" : "devis reçus"}
                    </span>
                  </div>

                  <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px" }}>
                    {req.description}
                  </p>

                  {req.proposals.length === 0 ? (
                    <div style={{ background: "var(--oj-color-subtle)", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "var(--oj-color-muted)" }}>
                      {isEn ? "Awaiting proposals from workshops..." : "En attente de réponses des ateliers partenaires..."}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                      {req.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          style={{
                            border: prop.status === "ACCEPTED" ? "2px solid var(--oj-color-action)" : "1px solid var(--oj-color-border)",
                            borderRadius: "var(--oj-radius-field)",
                            padding: "16px",
                            background: prop.status === "ACCEPTED" ? "var(--oj-color-subtle)" : "var(--oj-color-surface)",
                            position: "relative",
                          }}
                        >
                          {prop.status === "ACCEPTED" && (
                            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                              <span className="oj-status-pill success">{isEn ? "ACCEPTED" : "RETENU"}</span>
                            </div>
                          )}
                          <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                            {prop.artisan}
                          </div>
                          <div style={{ color: "var(--oj-color-muted)", fontSize: "12px", marginBottom: "12px" }}>
                            📍 {prop.city} · ⏱ {prop.days} {isEn ? "days lead time" : "jours de confection"}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>{isEn ? "Total Quote:" : "Devis total :"}</span>
                            <strong style={{ fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{formatPrice(prop.price)}</strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>{isEn ? "Deposit required:" : "Acompte direct :"}</span>
                            <span style={{ fontWeight: 600, color: "var(--oj-color-accent)", fontVariantNumeric: "tabular-nums" }}>{formatPrice(prop.advance)}</span>
                          </div>

                          <div style={{ fontSize: "12px", color: "var(--oj-color-muted)", background: "var(--oj-color-subtle)", padding: "10px", borderRadius: "6px", marginBottom: "14px", fontStyle: "italic" }}>
                            "{prop.notes}"
                          </div>

                          {prop.status !== "ACCEPTED" && (
                            <button
                              className="oj-btn-primary"
                              style={{ width: "100%", fontSize: "13px", padding: "10px" }}
                              onClick={() => {
                                setRequestsList((prev) =>
                                  prev.map((r) =>
                                    r.id === req.id
                                      ? {
                                          ...r,
                                          proposals: r.proposals.map((p) => ({
                                            ...p,
                                            status: p.id === prop.id ? "ACCEPTED" : "DECLINED",
                                          })),
                                        }
                                      : r
                                  )
                                );
                                setProposalAccepted(true);
                              }}
                            >
                              {isEn ? "Accept this quote & Order →" : "Accepter ce devis & Commander →"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== D02 ARTISAN QUOTE SUBMISSION MODAL (S27) ==================== */}
      {quoteModalOpen && selectedRequestForQuote && (
        <div className="oj-modal-overlay" onClick={() => setQuoteModalOpen(false)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "32px" }}>
            <button
              onClick={() => setQuoteModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "ARTISAN PROPOSAL (S27)" : "DEVIS ATELIER SUR-MESURE (S27)"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "8px 0 8px" }}>
              {isEn ? "Submit Artisan Quote" : "Soumettre un devis artisan"}
            </h2>
            <div style={{ background: "var(--oj-color-subtle)", padding: "12px 16px", borderRadius: "var(--oj-radius-field)", marginBottom: "20px", fontSize: "13px" }}>
              <strong>{selectedRequestForQuote.title}</strong>
              <div style={{ color: "var(--oj-color-muted)", marginTop: "4px" }}>
                Client : {selectedRequestForQuote.buyerName} ({selectedRequestForQuote.buyerCity}) · Budget indicatif : {selectedRequestForQuote.budget}
              </div>
            </div>

            {quoteSuccessMsg ? (
              <div style={{ background: "#E6F4EE", color: "#185F46", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>✓</div>
                <strong>{quoteSuccessMsg}</strong>
                <div style={{ marginTop: "16px" }}>
                  <button className="oj-btn-primary" onClick={() => { setQuoteSuccessMsg(""); setQuoteModalOpen(false); }}>
                    {isEn ? "Done" : "Fermer"}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const priceNum = parseInt(quotePrice, 10) || 0;
                  const advNum = parseInt(quoteAdvance, 10) || 0;
                  const daysNum = parseInt(quoteDays, 10) || 10;
                  setRequestsList((prev) =>
                    prev.map((r) => {
                      if (r.id === selectedRequestForQuote.id) {
                        const newProp = {
                          id: `prop-${Date.now()}`,
                          artisan: "Alexandre Cuir Prestige",
                          city: "Cotonou",
                          price: priceNum,
                          advance: advNum,
                          days: daysNum,
                          notes: quoteNotes,
                          status: "PENDING",
                        };
                        return {
                          ...r,
                          proposalsCount: r.proposalsCount + 1,
                          proposals: [...r.proposals, newProp],
                        };
                      }
                      return r;
                    })
                  );
                  setQuoteSuccessMsg(isEn ? "Quote submitted successfully to client!" : "Votre devis a été transmis au client avec succès !");
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Total Quote (FCFA) *" : "Prix total proposé (FCFA) *"}
                    </label>
                    <input
                      type="number"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      required
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                        border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                        color: "var(--oj-color-text)", fontSize: "14px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Advance Required (FCFA) *" : "Acompte requis (FCFA) *"}
                    </label>
                    <input
                      type="number"
                      value={quoteAdvance}
                      onChange={(e) => setQuoteAdvance(e.target.value)}
                      required
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                        border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                        color: "var(--oj-color-text)", fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Execution Lead Time (Days) *" : "Délai de fabrication (jours) *"}
                  </label>
                  <input
                    type="number"
                    value={quoteDays}
                    onChange={(e) => setQuoteDays(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "14px"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Workshop Notes & Specifications *" : "Spécifications & Engagements atelier *"}
                  </label>
                  <textarea
                    rows={3}
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "13px"
                    }}
                  />
                </div>

                <button type="submit" className="oj-btn-primary" style={{ width: "100%" }}>
                  {isEn ? "Submit Official Quote (S27) →" : "Transmettre le devis officiel (S27) →"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== FINOPS MANUAL COLLECTION MODAL (S46) ==================== */}
      {collectModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setCollectModalOpen(false)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "32px" }}>
            <button
              onClick={() => setCollectModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "FINOPS S46 — MANUAL COLLECTION" : "FINOPS S46 — ENCAISSEMENT MANUEL"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "8px 0 8px" }}>
              {isEn ? "Record Payment Collection" : "Enregistrer un Encaissement"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: "0 0 20px" }}>
              {isEn
                ? "Record a payment received directly via Mobile Money, bank transfer, or cash on delivery. Updates ledger immutably."
                : "Enregistrez un paiement perçu directement (MTN MoMo, Moov, Espèces, Virement). Génère un événement audit immuable."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseInt(collectAmount, 10) || 0;
                setFinopsEntries((prev) => [
                  {
                    id: `fin-${Date.now()}`,
                    type: "ENCAISSEMENT",
                    label: collectLabel,
                    channel: collectChannel,
                    amount: amt,
                    reference: collectRef,
                    time: "À l'instant",
                    status: "Confirmé par vendeur",
                  },
                  ...prev,
                ]);
                setFinopsKpis((prev) => ({
                  ...prev,
                  encaisse: prev.encaisse + amt,
                  restant: Math.max(0, prev.restant - amt),
                }));
                setCollectModalOpen(false);
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {isEn ? "Payment Label / Order Ref *" : "Libellé de la vente / Réf commande *"}
                </label>
                <input
                  type="text"
                  value={collectLabel}
                  onChange={(e) => setCollectLabel(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)", fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Amount Collected (FCFA) *" : "Montant encaissé (FCFA) *"}
                  </label>
                  <input
                    type="number"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "14px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Payment Channel *" : "Canal de règlement *"}
                  </label>
                  <select
                    value={collectChannel}
                    onChange={(e) => setCollectChannel(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "14px"
                    }}
                  >
                    <option value="MTN MoMo">MTN Mobile Money</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Celtiis Cash">Celtiis Cash</option>
                    <option value="Espèces">Espèces comptoir</option>
                    <option value="Virement">Virement bancaire</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {isEn ? "Transaction Reference *" : "Référence / N° de transaction *"}
                </label>
                <input
                  type="text"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)", fontSize: "14px"
                  }}
                />
              </div>

              <button type="submit" className="oj-btn-primary" style={{ width: "100%" }}>
                {isEn ? "Confirm Collection (Append-Only Event) →" : "Valider l'encaissement (Append-Only Event) →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== FINOPS DAILY CLOSE MODAL (S44) ==================== */}
      {dailyCloseModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setDailyCloseModalOpen(false)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px", padding: "32px", maxHeight: "90vh", overflowY: "auto" }}>
            <button
              onClick={() => setDailyCloseModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "FINOPS S44 — DAILY CLOSURE" : "FINOPS S44 — CLÔTURE DE JOURNÉE"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "8px 0 8px" }}>
              {isEn ? "Daily Cashbook Close & Reconciliation" : "Clôture de Caisse & Rapprochement"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: "0 0 20px" }}>
              {isEn
                ? "Compare theoretical system collections with physical cash and mobile money statements. Irreversible audit seal."
                : "Vérifiez la concordance entre les encaissements théoriques et vos relevés réels. Scellement immuable de la journée."}
            </p>

            {/* Breakdown table */}
            <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700 }}>
                {isEn ? "Theoretical System Breakdown" : "Ventilation Théorique du Système"}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>MTN Mobile Money :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel.includes("MTN")).reduce((s, e) => s + e.amount, 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Moov / Celtiis :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel.includes("Moov") || e.channel.includes("Celtiis")).reduce((s, e) => s + e.amount, 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Espèces en caisse théorique :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel === "Espèces").reduce((s, e) => s + e.amount, 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Virements bancaires :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel === "Virement").reduce((s, e) => s + e.amount, 0))}</strong>
                </div>
                <div style={{ borderTop: "1px solid var(--oj-color-border)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>Total Théorique Encaissé :</span>
                  <span style={{ color: "var(--oj-color-action)" }}>{formatPrice(finopsKpis.encaisse)}</span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setClosureSuccess(true);
                setDailyCloseModalOpen(false);
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {isEn ? "Physical Cash Count (FCFA) *" : "Comptage physique des espèces (FCFA) *"}
                </label>
                <input
                  type="number"
                  value={physicalCashInput}
                  onChange={(e) => setPhysicalCashInput(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)", fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {isEn ? "Audit Notes & Observations *" : "Notes de clôture & Observations *"}
                </label>
                <input
                  type="text"
                  value={closeNotesInput}
                  onChange={(e) => setCloseNotesInput(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)", fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ background: "#E6F4EE", padding: "12px 16px", borderRadius: "8px", fontSize: "12px", color: "#185F46", marginBottom: "20px" }}>
                🔒 La validation scelle le registre de la date du jour. Toute modification ultérieure sera consignée comme écriture de contre-passation auditable.
              </div>

              <button type="submit" className="oj-btn-primary" style={{ width: "100%" }}>
                {isEn ? "Sign & Validate Day Close (S44) →" : "Signer et Valider la Clôture (S44) →"}
              </button>
            </form>
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
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleSelectUniverse("seller"); }}>{isEn ? "Seller Pro" : "Espace Vendeur Pro"}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); handleSelectUniverse("seller"); }}>{isEn ? "Cashbook" : "Livre de caisse"}</a></li>
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
              handleSelectUniverse("seller");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            label: isEn ? "Account" : "Connexion",
            icon: <IconUser />,
            active: false,
            onClick: () => {
              if (currentUser) {
                setUserMenuOpen(true);
              } else {
                setAuthModalOpen(true);
              }
            },
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

      {/* ==================== SELLER ACCESS GATE MODAL ==================== */}
      {sellerGateModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setSellerGateModalOpen(false)}>
          <div
            className="oj-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "36px 32px",
              maxWidth: "480px",
              borderRadius: "var(--oj-radius-section)",
              backgroundColor: "var(--oj-color-surface)",
              border: "1px solid rgba(212, 180, 131, 0.4)",
              boxShadow: "var(--oj-shadow-lg)",
            }}
          >
            <button
              onClick={() => setSellerGateModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "var(--oj-color-text)",
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "28px",
                  backgroundColor: "rgba(212, 180, 131, 0.15)",
                  border: "1.5px solid var(--oj-color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "24px",
                }}
              >
                👑
              </div>
              <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", letterSpacing: "0.14em" }}>
                {isEn ? "ARTISAN & MERCHANT ACCESS" : "ESPACE ATELIER & VENDEUR"}
              </span>
              <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "8px 0 10px", color: "var(--oj-color-text)" }}>
                {isEn ? "Protected Artisan Space" : "Accès Réservé aux Maîtres Artisans"}
              </h2>
              <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
                {isEn
                  ? "Sign in with your verified merchant account to manage your orders, direct Mobile Money payments, and bespoke requests."
                  : "Connectez-vous avec votre compte marchand pour gérer vos commandes, vos encaissements Mobile Money et vos devis sur-mesure."}
              </p>
            </div>

            {/* Quick Demo Connect */}
            <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", marginBottom: "20px", border: "1px solid var(--oj-color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--oj-color-accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ⚡ Accès Immédiat Démo
                </span>
                <span style={{ fontSize: "11px", color: "var(--oj-color-muted)" }}>Maison Laurent</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--oj-color-text)", margin: "0 0 12px", lineHeight: "1.4" }}>
                Accédez instantanément au tableau de bord, au carnet de commandes et au livre de caisse d'Alexandre Laurent.
              </p>
              <button
                className="oj-btn-primary"
                onClick={() => handleLogin(DEMO_SELLER_USER)}
                style={{ width: "100%", height: "42px", fontSize: "13px" }}
              >
                Entrer dans l'Atelier (Maison Laurent) →
              </button>
            </div>

            {/* Custom Phone / OTP Login */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (authStep === "phone") {
                  setAuthStep("otp");
                } else {
                  handleLogin({
                    id: `usr-seller-${Date.now()}`,
                    name: "Alexandre Laurent",
                    phone: authIdentifier,
                    role: "SELLER",
                    shopName: "Atelier d'Art",
                    shopInitials: "AA",
                  });
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Merchant Phone Number / Email" : "Numéro Marchand (Bénin / UEMOA) ou Email"}
                </label>
                <input
                  type="text"
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  placeholder="+229 90 00 00 02"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                  }}
                />
              </div>

              {authStep === "otp" && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--oj-color-text)" }}>
                    {isEn ? "SMS Verification Code (OTP)" : "Code de Vérification SMS (OTP)"}
                  </label>
                  <input
                    type="text"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    placeholder="123456"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)",
                      backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)",
                      fontSize: "14px",
                      letterSpacing: "4px",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  />
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px", display: "block", marginTop: "4px" }}>
                    Code démo test : 123456
                  </small>
                </div>
              )}

              <button type="submit" className="oj-btn-secondary" style={{ width: "100%", height: "42px", fontSize: "13px" }}>
                {authStep === "phone" ? (isEn ? "Receive Login Code →" : "Recevoir mon code d'accès →") : (isEn ? "Verify & Enter →" : "Vérifier et Accéder →")}
              </button>
            </form>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--oj-color-border)", textAlign: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>
                Vous n'avez pas encore d'atelier certifié ?{" "}
              </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(isEn ? "Merchant onboarding application form opened." : "Formulaire de candidature Maître Artisan ouvert.");
                }}
                style={{ color: "var(--oj-color-accent)", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
              >
                Déposer une candidature →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GENERAL AUTH MODAL (Buyer / Seller / Admin) ==================== */}
      {authModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div
            className="oj-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "36px 32px",
              maxWidth: "480px",
              borderRadius: "var(--oj-radius-section)",
              backgroundColor: "var(--oj-color-surface)",
              border: "1px solid var(--oj-color-border)",
              boxShadow: "var(--oj-shadow-lg)",
            }}
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "var(--oj-color-text)",
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", letterSpacing: "0.14em" }}>
                OJARKET · AUTHENTIFICATION
              </span>
              <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "8px 0 8px", color: "var(--oj-color-text)" }}>
                {isEn ? "Account Sign In" : "Connexion à votre Espace"}
              </h2>
              <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: 0 }}>
                {isEn ? "Select your profile to access your personalized space." : "Sélectionnez votre profil pour accéder à votre univers dédié."}
              </p>
            </div>

            {/* Role Select Tabs */}
            <div
              style={{
                display: "flex",
                backgroundColor: "var(--oj-color-subtle)",
                borderRadius: "var(--oj-radius-pill)",
                padding: "4px",
                marginBottom: "20px",
                gap: "4px",
              }}
            >
              {[
                { id: "BUYER", label: "🛍️ Acheteur" },
                { id: "SELLER", label: "👑 Artisan" },
                { id: "ADMIN", label: "🛡️ Admin" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAuthRoleTab(tab.id as any);
                    setAuthStep("phone");
                    if (tab.id === "BUYER") setAuthIdentifier("+229 97 00 00 01");
                    if (tab.id === "SELLER") setAuthIdentifier("+229 90 00 00 02");
                    if (tab.id === "ADMIN") setAuthIdentifier("admin@ojarket.bj");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: "var(--oj-radius-pill)",
                    backgroundColor: authRoleTab === tab.id ? "var(--oj-color-surface)" : "transparent",
                    color: authRoleTab === tab.id ? "var(--oj-color-text)" : "var(--oj-color-muted)",
                    fontWeight: authRoleTab === tab.id ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: authRoleTab === tab.id ? "var(--oj-shadow-sm)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* One-Click Fast Login for the Selected Role */}
            <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", marginBottom: "20px", border: "1px solid var(--oj-color-border)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--oj-color-accent)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.08em" }}>
                ⚡ Profil Démo Rapide
              </div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--oj-color-text)", marginBottom: "2px" }}>
                {authRoleTab === "BUYER" && "Amina Diop (Client Privilège · Cotonou)"}
                {authRoleTab === "SELLER" && "Alexandre Laurent (Maison Laurent · Maroquinerie)"}
                {authRoleTab === "ADMIN" && "Superviseur Plateforme (Direction Ojarket)"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--oj-color-muted)", marginBottom: "12px" }}>
                {authRoleTab === "BUYER" && "Accès commandes acheteur, favoris et demandes sur-mesure."}
                {authRoleTab === "SELLER" && "Accès atelier vendeur, tableau de bord, FinOps et devis."}
                {authRoleTab === "ADMIN" && "Supervision multi-marchand, corridors KYC et grand livre."}
              </div>
              <button
                className="oj-btn-primary"
                onClick={() => {
                  if (authRoleTab === "BUYER") handleLogin(DEMO_BUYER_USER);
                  if (authRoleTab === "SELLER") handleLogin(DEMO_SELLER_USER);
                  if (authRoleTab === "ADMIN") handleLogin(DEMO_ADMIN_USER);
                }}
                style={{ width: "100%", height: "40px", fontSize: "13px" }}
              >
                Se connecter en tant que {authRoleTab === "BUYER" ? "Acheteur" : (authRoleTab === "SELLER" ? "Artisan Vendeur" : "Administrateur")} →
              </button>
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (authRoleTab === "BUYER") handleLogin(DEMO_BUYER_USER);
                else if (authRoleTab === "SELLER") handleLogin(DEMO_SELLER_USER);
                else handleLogin(DEMO_ADMIN_USER);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--oj-color-text)" }}>
                  {authRoleTab === "ADMIN" ? "Email Superviseur" : "Numéro de téléphone / Email"}
                </label>
                <input
                  type="text"
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  placeholder={authRoleTab === "ADMIN" ? "admin@ojarket.bj" : "+229 97 00 00 00"}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--oj-radius-field)",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                  }}
                />
              </div>

              <button type="submit" className="oj-btn-secondary" style={{ width: "100%", height: "40px", fontSize: "13px" }}>
                Valider la connexion →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
