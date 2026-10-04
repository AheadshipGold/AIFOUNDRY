"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DesignProvider, useDesign } from "../design-system/provider";
import { translations, Locale } from "@aifoundry/shared";
import "../design-system/styles.css";
import "./landing.css";
import { WebAuthModal } from "../components/WebAuthModal";
import { WebSellerOnboardingModal } from "../components/WebSellerOnboardingModal";
import {
  AuthApi,
  getStoredToken,
  getStoredUser,
  clearSession,
  SellerApi,
  OrdersApi,
  RequestsApi,
  type AuthUser,
  type OrderRecord,
  type PurchaseRequestItem,
  type FinOpsEntry,
  type CashbookData,
  type SellerDashboardData,
} from "../lib/api";


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
      name: "Horlogerie Prestige",
      city: "Abidjan",
      verified: true,
      rating: 5.0,
      salesCount: 186,
      initials: "HP",
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
    category: "art",
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
      "Sculpture royale en bronze massif patiné à l'or et à la cire perdue, pièce d'art de prestige du plateau d'Abomey.",
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
    title: "Traité de Modélisme & Patrons 1:1",
    subtitle: "Patrons vectoriels A0/A4 · Sac Cabas Royal",
    category: "digital",
    price: 6500,
    currency: "XOF",
    rating: 4.9,
    reviewsCount: 215,
    seller: {
      name: "Studio Éditions",
      city: "Dakar",
      verified: true,
      rating: 4.9,
      salesCount: 890,
      initials: "SE",
    },
    image: "/products/digital-patterns.jpg",
    description:
      "Guide complet et patrons vectoriels haute résolution A0/A4 détaillant le traçage, le parage et l'assemblage au point sellier.",
    stock: 999,
    variants: [{ name: "PDF Vectoriel A0/A4 (14.5 Mo)", color: "#0D4A38" }],
  },
  {
    id: "prod-7",
    title: "Guide Fonte à la Cire Perdue",
    subtitle: "Manuel d'alliages & moulage noble",
    category: "digital",
    price: 12000,
    currency: "XOF",
    rating: 5.0,
    reviewsCount: 54,
    seller: {
      name: "Fonderie Royale d'Abomey",
      city: "Abomey",
      verified: true,
      rating: 5.0,
      salesCount: 140,
      initials: "FA",
    },
    image: "/products/digital-patterns.jpg",
    description:
      "Traité technique complet sur la préparation des cires d'abeille, les moules réfractaires et les alliages de bronze traditionnels.",
    stock: 999,
    variants: [{ name: "E-Book Haute Définition (28.4 Mo)", color: "#D4B483" }],
  },
  {
    id: "prod-8",
    title: "Tenture Murale Bogolan & Soie",
    subtitle: "Soie sauvage · Pigments d'argile",
    category: "art",
    price: 36000,
    currency: "XOF",
    rating: 4.8,
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

export type AuthSessionUser = AuthUser;

function MainMarketplaceView() {
  const { locale, setLocale, theme, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = theme === "dark";
  const t = translations[(locale as Locale) || "fr"];

  // Authentication & Gating state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sellerGateModalOpen, setSellerGateModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  // Load real session on mount & sync with Better Auth backend
  useEffect(() => {
    const cachedUser = getStoredUser();
    if (cachedUser) {
      setCurrentUser(cachedUser);
    }
    const token = getStoredToken();
    if (token) {
      AuthApi.getMe()
        .then((user) => {
          if (user) {
            setCurrentUser(user);
          }
        })
        .catch(() => {
          clearSession();
          setCurrentUser(null);
        });
    }
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    if (user.role === "SELLER") {
      setUniverse("seller");
    }
  };

  const handleLogout = () => {
    AuthApi.logout();
    setCurrentUser(null);
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
  const [requestsList, setRequestsList] = useState<any[]>([
    {
      id: "req-01",
      buyerName: "Amina Diop",
      buyerCity: "Cotonou",
      category: "Joaillerie & Bronze",
      title: "Parure de joaillerie en bronze ciselé",
      description: "Recherche d'une boutique ou joaillier capable de fournir un collier plastron sous 15 jours.",
      budget: "280 000 FCFA",
      proposals: [
        {
          id: "prop-01",
          sellerName: "Maison Laurent",
          sellerCity: "Porto-Novo",
          price: "270 000 FCFA",
          advance: "100 000 FCFA",
          delayDays: 10,
          notes: "Bronze noble poli, ébauche sous 4 jours, livraison soignée.",
          status: "ACCEPTED",
        },
      ],
    },
  ]);

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

  // Real Database Connected State for Seller Universe
  const [sellerOrders, setSellerOrders] = useState<OrderRecord[]>([]);
  const [sellerRequests, setSellerRequests] = useState<PurchaseRequestItem[]>([]);
  const [finopsEntries, setFinopsEntries] = useState<FinOpsEntry[]>([]);
  const [finopsKpis, setFinopsKpis] = useState({
    vendu: 0,
    encaisse: 0,
    restant: 0,
  });
  const [sellerLoading, setSellerLoading] = useState(false);

  const isDemoAccount = (user: AuthUser | null) => {
    if (!user) return false;
    return user.email === "demo@ojarket.test" || user.email === "alexandre@ojarket.test";
  };

  const fetchSellerData = async (user: AuthUser | null) => {
    if (!user) {
      setSellerOrders([]);
      setSellerRequests([]);
      setFinopsEntries([]);
      setFinopsKpis({ vendu: 0, encaisse: 0, restant: 0 });
      return;
    }

    const isDemo = isDemoAccount(user);
    if (isDemo) {
      // Demo test accounts only: sample data for presentation
      setSellerRequests([
        {
          id: "req-01",
          buyerName: "Amina Diop",
          buyerPhone: "+229 97 00 00 01",
          title: "Parure de joaillerie en bronze ciselé",
          description: "Recherche d'une boutique ou joaillier capable de fournir un collier plastron sous 15 jours.",
          category: "Joaillerie & Bronze",
          targetBudgetMinor: 28000000,
          currency: "XOF",
          status: "OPEN",
          proposals: [],
          createdAt: new Date().toISOString(),
        },
      ]);
      setSellerOrders([
        {
          id: "ord-01",
          orderNumber: "CMD-2847",
          buyerName: "Amina Diop",
          totalAmountMinor: 4800000,
          currency: "XOF",
          paymentChannel: "MTN MoMo",
          fulfillmentStatus: "PREPARING",
          createdAt: new Date().toISOString(),
        },
      ]);
      setFinopsEntries([
        {
          id: "fin-01",
          type: "ENCAISSEMENT",
          label: "Commande CMD-2847",
          channel: "MTN MoMo",
          amountMinor: 4800000,
          reference: "TXN-MTN-89021",
          time: "14:32",
        },
      ]);
      setFinopsKpis({ vendu: 48000, encaisse: 48000, restant: 0 });
      return;
    }

    // REAL REGISTERED USER (e.g. ABRAHAM B. A., or any user): query real database!
    const targetShopId = user.activeShop?.id || (user.shops && user.shops[0]?.id);
    setSellerLoading(true);

    try {
      const [cb, ord, reqs] = await Promise.all([
        SellerApi.getCashbook(targetShopId).catch(() => null),
        OrdersApi.getAll(targetShopId).catch(() => []),
        RequestsApi.getAll().catch(() => []),
      ]);

      const vendu = cb?.summary?.totalVenduMinor ? Math.round(cb.summary.totalVenduMinor / 100) : 0;
      const encaisse = cb?.summary?.totalEncaisseMinor ? Math.round(cb.summary.totalEncaisseMinor / 100) : 0;
      const restant = cb?.summary?.totalRestantMinor ? Math.round(cb.summary.totalRestantMinor / 100) : 0;
      setFinopsKpis({ vendu, encaisse, restant });

      setSellerOrders(ord || []);
      setSellerRequests(reqs || []);

      if (cb?.recentEntries && Array.isArray(cb.recentEntries)) {
        setFinopsEntries(cb.recentEntries);
      } else {
        setFinopsEntries([]);
      }
    } catch (err) {
      console.warn("Failed to load real seller data from backend", err);
      setSellerOrders([]);
      setSellerRequests([]);
      setFinopsEntries([]);
      setFinopsKpis({ vendu: 0, encaisse: 0, restant: 0 });
    } finally {
      setSellerLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData(currentUser);
  }, [currentUser]);


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
    { id: "art", label: isEn ? "Sculptures" : "Art & Bronze", image: "/products/art-bronze.jpg", isAll: false },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: "/products/digital-patterns.jpg", isAll: false },
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
                  ? "Search for products, stores, brands..."
                  : "Rechercher un produit, une boutique, une marque..."
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
                          ? `👑 Vendeur Certifié · ${currentUser.shopName || "Boutique"}`
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
                      {universe === "buyer" ? "Basculer vers Espace Vendeur ↗" : "Basculer vers Espace Acheteur ↗"}
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
                <p>{isEn ? "No products matching your query." : "Aucun produit ne correspond."}</p>
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
                      {p.category === "digital" && (
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(2, 43, 34, 0.92)",
                            color: "var(--oj-color-accent)",
                            fontSize: "10px",
                            fontWeight: 800,
                            border: "1px solid var(--oj-color-accent)",
                            letterSpacing: "0.5px",
                            zIndex: 2,
                          }}
                        >
                          ⚡ NUMÉRIQUE
                        </span>
                      )}
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
                        {p.category === "digital" ? (
                          <button
                            className="oj-btn-primary"
                            onClick={() => addToCart(p)}
                            style={{
                              height: "36px",
                              padding: "0 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              borderRadius: "var(--oj-radius-field)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>⚡</span>
                            <span>{isEn ? "Download" : "Télécharger"}</span>
                          </button>
                        ) : (
                          <button
                            className="oj-prod-cart-btn"
                            onClick={() => addToCart(p)}
                            title={isEn ? "Add to cart" : "Ajouter au panier"}
                          >
                            <IconCart />
                          </button>
                        )}
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
                  name: "Maison Horlogerie",
                  initials: "MH",
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
                {isEn ? "CUSTOM ORDERS & QUOTES" : "DEVIS & COMMANDES SPÉCIFIQUES"}
              </span>
              <h2 className="oj-demand-title">
                {isEn ? "Looking for a specific product or bulk order?" : "Vous cherchez un produit spécifique ou sur-mesure ?"}
              </h2>
              <p className="oj-demand-subtitle">
                {isEn
                  ? "Describe your need. Verified partner stores will submit tailored proposals with clear timelines."
                  : "Décrivez votre besoin. Les boutiques et vendeurs partenaires vous soumettront directement leurs propositions personnalisées avec délais et devis clairs."}
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
                  {currentUser?.name
                    ? (isEn ? `Welcome back, ${currentUser.name.trim().split(/\s+/)[0]} 👋` : `Bonjour ${currentUser.name.trim().split(/\s+/)[0]} 👋`)
                    : (isEn ? "Welcome back 👋" : "Bonjour 👋")}
                </h1>
                <p style={{ color: "var(--oj-color-muted)", margin: 0 }}>
                  {isEn
                    ? "Manage your store, orders and payments."
                    : "Gérez votre boutique, vos commandes et vos encaissements."}
                </p>
              </div>
              <span className="oj-verified-pill" style={{ fontSize: "12px", padding: "4px 12px" }}>
                {currentUser?.activeShop?.name || "Boutique Vendeur"}
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
                    ? isEn ? `Buyer Demands (${sellerRequests.length})` : `Demandes acheteurs (${sellerRequests.length})`
                    : tab === "orders"
                    ? isEn ? `Orders (${sellerOrders.length})` : `Commandes (${sellerOrders.length})`
                    : isEn ? "Cashbook & FinOps" : "Caisse & FinOps"}
                </button>
              ))}
            </div>

            {sellerTab === "overview" && (
              <div>
                <div className="oj-kpi-grid">
                  {[
                    {
                      label: isEn ? "Sales" : "Ventes",
                      value: formatPrice(finopsKpis.vendu),
                      trend: finopsKpis.vendu > 0 ? "+100%" : "0%",
                      positive: finopsKpis.vendu > 0,
                    },
                    {
                      label: isEn ? "Orders" : "Commandes",
                      value: `${sellerOrders.length}`,
                      trend: sellerOrders.length > 0 ? `+${sellerOrders.length}` : "0",
                      positive: sellerOrders.length > 0,
                    },
                    {
                      label: isEn ? "Requests" : "Demandes clients",
                      value: `${sellerRequests.length}`,
                      trend: sellerRequests.length > 0 ? `+${sellerRequests.length}` : "0",
                      positive: sellerRequests.length > 0,
                    },
                    {
                      label: isEn ? "Low Stock" : "Stock faible",
                      value: "0",
                      trend: isEn ? "Items" : "Articles",
                      positive: true,
                    },
                  ].map((kpi, i) => (
                    <div key={i} className="oj-kpi-card">
                      <div className="oj-kpi-header">
                        <span>{kpi.label}</span>
                        <span className={`oj-kpi-trend ${kpi.positive ? "positive" : "neutral"}`}>
                          {kpi.positive ? "↗" : "•"} {kpi.trend}
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
                    {
                      label: isEn ? "Orders to prepare" : "Commandes à préparer",
                      count: `${sellerOrders.filter(o => o.fulfillmentStatus === 'PREPARING' || o.fulfillmentStatus === 'PENDING').length}`,
                      action: () => setSellerTab("orders"),
                    },
                    {
                      label: isEn ? "Buyer requests to quote" : "Demandes clients à chiffrer",
                      count: `${sellerRequests.filter(r => r.status === 'OPEN').length}`,
                      action: () => setSellerTab("opportunities"),
                    },
                    {
                      label: isEn ? "Direct payments recorded" : "Encaissements enregistrés",
                      count: `${finopsEntries.length}`,
                      action: () => setSellerTab("cashbook"),
                    },
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
                      {isEn ? "Buyer Demands & Opportunities" : "Demandes Acheteurs & Opportunités"}
                    </h3>
                    <p style={{ margin: 0, color: "var(--oj-color-muted)", fontSize: "13px" }}>
                      {isEn ? "Browse requests submitted by clients and propose formal quotes." : "Consultez les demandes publiées par les clients et proposez vos devis."}
                    </p>
                  </div>
                </div>

                {quoteSuccessMsg && (
                  <div style={{ background: "#E6F4EE", color: "#185F46", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", fontWeight: 600, fontSize: "13px" }}>
                    ✓ {quoteSuccessMsg}
                  </div>
                )}

                {sellerRequests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>🛍️</div>
                    <h4 style={{ margin: "0 0 8px", fontFamily: "var(--oj-font-editorial)", fontSize: "18px" }}>
                      {isEn ? "No buyer demands at the moment" : "Aucune demande acheteur pour le moment"}
                    </h4>
                    <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: 0, maxWidth: "440px", marginLeft: "auto", marginRight: "auto" }}>
                      {isEn ? "Custom product requests from buyers will automatically appear here." : "Les demandes spécifiques des acheteurs apparaîtront automatiquement ici dès leur publication."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {sellerRequests.map((req) => (
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
                              {req.buyerName}
                            </span>
                          </div>
                          <h4 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 600 }}>{req.title}</h4>
                          <p style={{ margin: "0 0 16px", color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.5" }}>
                            {req.description}
                          </p>
                          <div style={{ display: "flex", gap: "20px", fontSize: "13px" }}>
                            <div>
                              <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Target Budget:" : "Budget indicatif :"} </span>
                              <strong style={{ color: "var(--oj-color-action)" }}>
                                {req.targetBudgetMinor ? formatPrice(Math.round(req.targetBudgetMinor / 100)) : "À négocier"}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Quotes:" : "Devis soumis :"} </span>
                              <strong>{req.proposals?.length || 0}</strong>
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
                )}
              </div>
            )}

            {sellerTab === "orders" && (
              <div>
                {sellerOrders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
                    <h4 style={{ margin: "0 0 8px", fontFamily: "var(--oj-font-editorial)", fontSize: "18px" }}>
                      {isEn ? "No orders yet" : "Aucune commande pour le moment"}
                    </h4>
                    <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: 0, maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
                      {isEn ? "Your store is ready to receive orders. Your sales will appear here automatically." : "Votre boutique est prête à recevoir ses premières ventes. Vos commandes apparaîtront automatiquement ici."}
                    </p>
                  </div>
                ) : (
                  <table className="oj-order-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid var(--oj-color-border)", fontSize: "12px", color: "var(--oj-color-muted)" }}>
                          {isEn ? "Order" : "Commande"}
                        </th>
                        <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid var(--oj-color-border)", fontSize: "12px", color: "var(--oj-color-muted)" }}>
                          {isEn ? "Customer" : "Client"}
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
                      {sellerOrders.map((ord) => (
                        <tr key={ord.id}>
                          <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)" }}>
                            <div style={{ fontWeight: 600 }}>{ord.orderNumber}</div>
                            <small style={{ color: "var(--oj-color-muted)" }}>{ord.paymentChannel || "Paiement direct"}</small>
                          </td>
                          <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)" }}>
                            <div>{ord.buyerName}</div>
                            <small style={{ color: "var(--oj-color-muted)" }}>{ord.buyerPhone || ""}</small>
                          </td>
                          <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                            {formatPrice(Math.round(ord.totalAmountMinor / 100))}
                          </td>
                          <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)" }}>
                            <span className={`oj-status-pill ${ord.fulfillmentStatus === 'DELIVERED' ? 'success' : 'pending'}`}>
                              {ord.fulfillmentStatus || ord.paymentStatus || "En cours"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                  {finopsEntries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--oj-color-muted)" }}>
                      <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600 }}>
                        {isEn ? "No cashbook transactions yet" : "Aucun mouvement de caisse enregistré"}
                      </p>
                      <small style={{ fontSize: "13px" }}>
                        {isEn ? "Use the button above to record your direct sales and collections." : "Utilisez le bouton ci-dessus pour enregistrer vos encaissements et ventes directes."}
                      </small>
                    </div>
                  ) : (
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
                              <span className="oj-status-pill success">{e.status || "Confirmé"}</span>
                            </td>
                            <td style={{ padding: "14px 0", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                              {formatPrice(typeof e.amountMinor === "number" ? Math.round(e.amountMinor / 100) : (e as any).amount || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
                ? "Describe what you are looking for. Our network will transmit it to verified stores."
                : "Décrivez le produit que vous recherchez. Notre réseau le transmettra aux boutiques partenaires."}
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
                  {isEn ? "Stores will respond with proposals." : "Les boutiques vous répondront avec leurs devis et délais."}
                </p>
                <button className="oj-btn-primary" onClick={() => { setNeedSubmitted(false); setNeedModalOpen(false); }}>
                  {isEn ? "Back to catalog" : "Retour au catalogue"}
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
              {isEn ? "QUOTES & PROPOSALS — COMPARISON & ACCEPTANCE" : "DEVIS & OFFRES — COMPARATEUR DE PROPOSITIONS"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "8px 0 8px" }}>
              {isEn ? "My Demands & Store Proposals Received" : "Mes Demandes & Devis / Offres Reçues"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: "0 0 24px" }}>
              {isEn
                ? "Compare proposals received from verified partner stores. Choose the best offer to convert it into a confirmed order."
                : "Comparez les devis détaillés soumis par nos boutiques partenaires vérifiées. Sélectionnez la meilleure offre pour la convertir en commande ferme."}
            </p>

            {proposalAccepted && (
              <div style={{ background: "#E6F4EE", color: "#185F46", padding: "16px 20px", borderRadius: "10px", marginBottom: "24px", border: "1px solid #63DBB6" }}>
                <strong>✓ {isEn ? "Proposal Accepted!" : "Devis accepté avec succès !"}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  {isEn
                    ? "Order OJK-CMD-8921 created. The store has been notified to process the order upon receipt of direct deposit via Mobile Money."
                    : "Commande n° OJK-CMD-8921 créée. La boutique a été notifiée pour préparer la commande dès versement direct de l'acompte."}
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
                      {isEn ? "Awaiting proposals from stores..." : "En attente de réponses des boutiques partenaires..."}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                      {req.proposals.map((prop: any) => (
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
                                setRequestsList((prev: any[]) =>
                                  prev.map((r: any) =>
                                    r.id === req.id
                                      ? {
                                          ...r,
                                          proposals: r.proposals.map((p: any) => ({
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
              {isEn ? "STORE PROPOSAL (S27)" : "DEVIS & OFFRE COMMERÇANTE (S27)"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "8px 0 8px" }}>
              {isEn ? "Submit Store Quote" : "Soumettre une offre / devis boutique"}
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
                          artisan: "Alexandre Maroquinerie",
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
                    {isEn ? "Execution Lead Time (Days) *" : "Délai de préparation & livraison (jours) *"}
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
                    {isEn ? "Store Notes & Specifications *" : "Spécifications & Engagements boutique *"}
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
                    amountMinor: amt * 100,
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
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel.includes("MTN")).reduce((s, e) => s + Math.round((e.amountMinor || 0) / 100), 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Moov / Celtiis :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel.includes("Moov") || e.channel.includes("Celtiis")).reduce((s, e) => s + Math.round((e.amountMinor || 0) / 100), 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Espèces en caisse théorique :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel === "Espèces").reduce((s, e) => s + Math.round((e.amountMinor || 0) / 100), 0))}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Virements bancaires :</span>
                  <strong>{formatPrice(finopsEntries.filter(e => e.channel === "Virement").reduce((s, e) => s + Math.round((e.amountMinor || 0) / 100), 0))}</strong>
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
                  {isEn ? "Discover products" : "Découvrir les produits"}
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
                  {cart.some((i) => i.product.category === "digital") && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(212, 180, 131, 0.15)",
                        border: "1px solid var(--oj-color-accent)",
                        color: "var(--oj-color-text)",
                        fontSize: "12px",
                        lineHeight: 1.4,
                        marginBottom: "12px",
                      }}
                    >
                      ⚡ <strong>Livraison Numérique Immédiate :</strong> Les guides et fichiers numériques sont délivrés instantanément avec licence commerciale après validation.
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>{isEn ? "Total" : "Total"}</span>
                    <strong style={{ fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatPrice(cartTotal)}</strong>
                  </div>
                  <small style={{ display: "block", color: "var(--oj-color-muted)", fontSize: "12px", marginBottom: "16px" }}>
                    {isEn ? "Direct payment via Mobile Money or Card." : "Règlement direct Mobile Money (MTN, Moov, Wave) ou Carte."}
                  </small>
                  <button
                    className="oj-btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      const hasDigital = cart.some((i) => i.product.category === "digital");
                      alert(
                        hasDigital
                          ? (isEn
                              ? "Order placed! Your digital files and commercial license are now available in your space."
                              : "Commande validée ! Vos fichiers numériques et licences commerciales sont immédiatement accessibles.")
                          : (isEn ? "Order placed successfully!" : "Commande enregistrée avec succès !")
                      );
                      setCart([]);
                      setCartOpen(false);
                    }}
                  >
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
                ? "The modern e-commerce marketplace connecting buyers with verified merchants and stores."
                : "Le marché moderne reliant acheteurs et commerçants & boutiques vérifiés."}
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

      {/* ==================== SELLER ACCESS GATE & ONBOARDING MODAL ==================== */}
      <WebSellerOnboardingModal
        isOpen={sellerGateModalOpen}
        onClose={() => setSellerGateModalOpen(false)}
        currentUser={currentUser}
        onShopRegistered={(updatedUser) => {
          setCurrentUser(updatedUser);
          setSellerGateModalOpen(false);
          setUniverse("seller");
        }}
        onRequireLogin={() => {
          setSellerGateModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      {/* ==================== REAL AUTH MODAL (Better Auth & Backend Sync) ==================== */}
      <WebAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
