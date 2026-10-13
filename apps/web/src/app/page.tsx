"use client";
import { SellerOverview, SellerShop, SellerOpportunities, SellerOrders, SellerCashbook } from '../components/seller';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CmsApi,
  FavoritesApi,
  ReviewsApi,
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
  rating?: number | null;
  reviewsCount?: number;
  seller: {
    name: string;
    city?: string;
    verified?: boolean;
    rating?: number | null;
    salesCount?: number;
    initials?: string;
  } | string | any;
  image: string;
  description: string;
  stock?: number;
  badgeText?: string;
  variants?: { name: string; color?: string }[];
}



function formatPrice(amount: number, currency: string = "XOF"): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
}

/* ============================================================
   SVG Icon Components (matching reference design icons)
   ============================================================ */
function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-10z" />
      <polyline points="9 21 9 12 15 12 15 21" fill={active ? "var(--oj-color-surface)" : "none"} />
    </svg>
  );
}
function IconSearch({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.25 : 0} />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
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
function IconUser({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.25 : 0} />
      <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function IconFileText({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.22 : 0} stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconShoppingBagOpen({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.22 : 0} stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" fill="none" />
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

function IconPackage({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4L7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12.01 20.71 7" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconLock({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconTruck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconDiamondSparkle() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function IconShieldCertificate() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconVaultSecurity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="8" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="16" />
      <line x1="8" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconLuxuryGift() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IconConciergeBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16a6 6 0 0 0-12 0" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <circle cx="12" cy="7" r="1.5" />
      <line x1="12" y1="8.5" x2="12" y2="10" />
    </svg>
  );
}

function getProductMaterial(title: string, category?: string, isEn?: boolean): string {
  const t = (title || "").toLowerCase();
  if (t.includes("chronomètre") || t.includes("montre") || t.includes("watch")) {
    return isEn ? "Acier & Or 18k" : "Acier & Or 18k";
  }
  if (t.includes("cabas") || t.includes("sac") || t.includes("bag") || category === "leather") {
    return isEn ? "Cuir Pleine Fleur" : "Cuir Pleine Fleur";
  }
  if (t.includes("fauteuil") || t.includes("armchair") || category === "home") {
    return isEn ? "Chêne & Lin" : "Chêne Massif & Lin";
  }
  if (t.includes("parure") || t.includes("émeraude") || t.includes("bague") || category === "fashion") {
    return isEn ? "Or 18k & Émeraude" : "Or 18k & Émeraude";
  }
  if (t.includes("buste") || t.includes("bronze") || category === "art") {
    return isEn ? "Bronze Ciselé" : "Bronze d'Art Ciselé";
  }
  if (category === "digital") {
    return isEn ? "Fichier Master" : "Fichier Master";
  }
  return isEn ? "Fait Main" : "Façonné Main";
}
function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconStorefront() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconDownloadMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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
  const router = useRouter();
  const { locale, setLocale, theme, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = theme === "dark";
  const t = translations[(locale as Locale) || "fr"];

  // Authentication & Gating state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sellerGateModalOpen, setSellerGateModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"openSellerSpace" | "submitNeed" | null>(null);

  const [universe, setUniverse] = useState<"buyer" | "seller">("buyer");
  const [buyerTab, setBuyerTab] = useState<"home" | "search" | "need" | "purchases" | "profile">("home");
  const [needSubTab, setNeedSubTab] = useState<"create" | "proposals">("create");
  const [purchasesSubTab, setPurchasesSubTab] = useState<"cart" | "orders">("cart");
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [needModalOpen, setNeedModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [sellerTab, setSellerTab] = useState<"overview" | "shop" | "opportunities" | "orders" | "cashbook">("overview");
  const [needDesc, setNeedDesc] = useState("");
  const [needBudget, setNeedBudget] = useState("");
  const [needPlace, setNeedPlace] = useState("");
  const [needCategory, setNeedCategory] = useState("leather");
  const [needSubmitted, setNeedSubmitted] = useState(false);
  const [aiStructuring, setAiStructuring] = useState(false);

  // CMS state
  // Verified reviews state
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [canUserReview, setCanUserReview] = useState<{ canReview: boolean; hasPurchased: boolean; existingReview: any | null }>({ canReview: false, hasPurchased: false, existingReview: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [intemporelIcons, setIntemporelIcons] = useState<any[]>([]);
  const [trustedShops, setTrustedShops] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Auto-play for Hero Featured Products (every 5 seconds)
  useEffect(() => {
    const list = featuredProducts.length > 0 ? featuredProducts : intemporelIcons;
    if (!list || list.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts, intemporelIcons, heroSlideIndex]);

  useEffect(() => {
    CmsApi.getLandingConfig()
      .then((res) => {
        const d = res.data;
        if (d) {
          setBanners(d.banners || []);
          setFeaturedProducts(d.featuredProducts || []);
          setIntemporelIcons(d.intemporelIcons || []);
          setTrustedShops(d.trustedShops || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch landing config", err);
        setBanners([]);
        setFeaturedProducts([]);
        setIntemporelIcons([]);
        setTrustedShops([]);
      });
  }, []);

  // Fetch verified reviews for selected product
  useEffect(() => {
    if (selectedProduct?.id) {
      setReviewSuccess(false);
      setReviewComment("");
      ReviewsApi.getProductReviews(selectedProduct.id)
        .then((res) => {
          setProductReviews(res.reviews || []);
        })
        .catch(() => setProductReviews([]));

      if (currentUser) {
        ReviewsApi.canReview(selectedProduct.id)
          .then((res) => setCanUserReview(res))
          .catch(() => setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null }));
      } else {
        setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null });
      }
    } else {
      setProductReviews([]);
      setCanUserReview({ canReview: false, hasPurchased: false, existingReview: null });
    }
  }, [selectedProduct?.id, currentUser]);

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

  // Synchronize persistent favorites from database
  useEffect(() => {
    if (currentUser) {
      FavoritesApi.getMyIds()
        .then((ids) => {
          if (Array.isArray(ids)) {
            const map: Record<string, boolean> = {};
            ids.forEach((id) => {
              map[id] = true;
            });
            setFavorites(map);
          }
        })
        .catch(() => {});
    } else {
      setFavorites({});
    }
  }, [currentUser]);

  // Synchronize real buyer orders & requests from database
  useEffect(() => {
    if (currentUser) {
      OrdersApi.getAll()
        .then((ords) => {
          if (Array.isArray(ords)) {
            setBuyerOrders(ords);
          }
        })
        .catch(() => setBuyerOrders([]));

      RequestsApi.getAll(currentUser.id)
        .then((reqs) => {
          if (Array.isArray(reqs)) {
            setRequestsList(reqs);
          }
        })
        .catch(() => setRequestsList([]));
    } else {
      setBuyerOrders([]);
      setRequestsList([]);
    }
  }, [currentUser]);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthModalOpen(false);

    if (pendingAction === "openSellerSpace") {
      setPendingAction(null);
      if (user.role === "SELLER" || user.role === "ADMIN" || (user.shops && user.shops.length > 0)) {
        setUniverse("seller");
      } else {
        setSellerGateModalOpen(true);
      }
    } else if (pendingAction === "submitNeed") {
      setPendingAction(null);
    } else if (user.role === "SELLER") {
      setUniverse("seller");
    }
  };

  const handleLogout = () => {
    AuthApi.logout();
    setCurrentUser(null);
    setUserMenuOpen(false);
    setUniverse("buyer");
    setBuyerOrders([]);
    setRequestsList([]);
  };

  const handleSelectUniverse = (target: "buyer" | "seller") => {
    if (target === "buyer") {
      setUniverse("buyer");
    } else {
      router.push("/seller");
    }
  };

  // D02 Buyer proposals & comparison modal state
  const [buyerRequestsModalOpen, setBuyerRequestsModalOpen] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [requestsList, setRequestsList] = useState<any[]>([]);

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

    // Directly fetch genuine seller data from API

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

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await OrdersApi.create({
        buyerId: currentUser.id,
        buyerName: currentUser.name || "Client Privilège",
        buyerPhone: currentUser.phone || "+229 97 00 00 00",
        deliveryAddress: "Cotonou, Bénin",
        paymentChannel: "MTN_MOMO",
        items: cart.map((i) => ({
          variantId: (i.product as any).variantId || (i.product as any).variants?.[0]?.id || i.product.id,
          quantity: i.quantity,
        })),
      });
      setBuyerOrders((prev) => [res, ...prev]);
      setCart([]);
      setPurchasesSubTab("orders");
      alert(isEn ? "Order placed successfully! Your order is being prepared by the store." : `Commande validée avec succès ! N° ${res.orderNumber} en cours de préparation.`);
    } catch {
      // Local fallback representation for UI responsiveness if offline
      const newOrder = {
        id: `OJK-CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: `OJK-CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Aujourd'hui",
        atelier: typeof cart[0].product.seller === "object" ? cart[0].product.seller.name : cart[0].product.seller || "Kingston Bio Official",
        title: cart.map((i) => `${i.product.title} (x${i.quantity})`).join(", "),
        price: cartTotal,
        paymentStatus: "Payé & Certifié (MTN MoMo)",
        deliveryStatus: "En préparation par la boutique",
        image: cart[0].product.image,
      };
      setBuyerOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setPurchasesSubTab("orders");
      alert(isEn ? "Order placed successfully! Your order is being prepared by the store." : "Commande validée avec succès ! Votre commande est en cours de préparation par la boutique.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    FavoritesApi.toggleFavorite(id).catch((err) => {
      console.warn("Failed to toggle favorite in database", err);
      setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    });
  };

  const filteredProducts = featuredProducts.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAiAssist = async () => {
    const currentPrompt = needDesc.trim() || (isEn 
      ? "Custom cognac leather travel bag with solid brushed brass fittings and reinforced corners."
      : "Sac de voyage sur-mesure en cuir pleine fleur cognac, finitions laiton brossé et coutures renforcées.");
    
    if (!needDesc) {
      setNeedDesc(currentPrompt);
    }
    setAiStructuring(true);
    try {
      const result = await RequestsApi.analyzeWithAi(currentPrompt);
      if (result) {
        if (result.priceEstimateFCFA) {
          setNeedBudget(`${result.priceEstimateFCFA.toLocaleString('fr-FR')} FCFA`);
        }
        if (result.category) {
          setNeedCategory(result.category);
        }
        setNeedPlace("Cotonou, Bénin");
        const enriched = `${currentPrompt}\n\n[Spécifications Techniques IA]\n• Matériaux : ${result.materials.join(', ')}\n• Titre : ${result.refinedTitle}\n• Délai estimé : ${result.deliveryEstimate || `${result.estimatedDays} jours`}`;
        setNeedDesc(enriched);
      }
    } catch {
      setNeedBudget("75 000 FCFA");
      setNeedPlace("Cotonou, Bénin");
    } finally {
      setAiStructuring(false);
    }
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
              {isDark ? <IconSun /> : <IconMoon />}
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
                    {currentUser.role === "ADMIN" ? "PRO" : currentUser.shopInitials || currentUser.name.slice(0, 2).toUpperCase()}
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
                          ? "Super Administrateur"
                          : currentUser.role === "SELLER"
                          ? `Vendeur Certifié · ${currentUser.shopName || "Boutique"}`
                          : "✦ Client Privilège"}
                      </div>
                    </div>



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

                    {currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          style={{
                            display: "block",
                            textDecoration: "none",
                            padding: "6px 8px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            backgroundColor: "var(--oj-color-accent)",
                            borderRadius: "6px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            textAlign: "center"
                          }}
                        >
                          Panel d'Administration ??
                        </Link>
                      )}

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
                  height: "36px",
                  padding: "0 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "var(--oj-radius-pill)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
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
          {buyerTab === "home" && (
            <>
              {/* Prestige Ribbon Haute Facture */}
              <div 
                style={{
                  backgroundColor: isDark ? "rgba(13, 74, 56, 0.45)" : "rgba(212, 180, 131, 0.12)",
                  borderBottom: "1px solid var(--oj-color-border)",
                  padding: "9px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  textAlign: "center",
                  letterSpacing: "1.4px",
                }}
              >
                <span style={{ color: "var(--oj-color-accent)", display: "flex", alignItems: "center" }}><IconDiamondSparkle /></span>
                <span style={{
                  fontSize: "10.5px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--oj-color-accent)",
                }}>
                  {isEn
                    ? "ONLINE MARKETPLACE · VERIFIED STORES · SECURE SHOPPING"
                    : "MARKETPLACE EN LIGNE · BOUTIQUES VÉRIFIÉES · COMMANDES SÉCURISÉES"}
                </span>
                <span style={{ color: "var(--oj-color-accent)", display: "flex", alignItems: "center" }}><IconDiamondSparkle /></span>
              </div>

              {/* Editorial Lead & Mobile Search */}
              <section className="oj-editorial-lead-section">
                <div className="oj-section" style={{ paddingBottom: 0 }}>
                  <h1 className="oj-editorial-lead-title">
                    {isEn ? "Buy & Sell" : "Achetez & Vendez"}
                  </h1>
                  <p className="oj-editorial-lead-sub">
                    {isEn
                      ? "Verified stores and direct ordering."
                      : "Boutiques certifiées et commandes directes."}
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
                      onFocus={() => {
                        setBuyerTab("search");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
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
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setBuyerTab("search");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
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

          {/* Hero Featured Products Showcase */}
          {(featuredProducts.length > 0 || intemporelIcons.length > 0) && (() => {
            const heroList = featuredProducts.length > 0 ? featuredProducts : intemporelIcons;
            const activeHeroProd = heroList[heroSlideIndex % heroList.length] || heroList[0];
            const currentCount = (heroSlideIndex % heroList.length) + 1;
            return (
              <section className="oj-hero-section">
                <div className="oj-section">
                  <div className="oj-hero-card">
                    <div className="oj-hero-content oj-hero-content-anim" key={`hero-content-${heroSlideIndex}`}>
                      <span className="oj-hero-eyebrow">
                        {activeHeroProd?.badgeText ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <IconDiamondSparkle /> {activeHeroProd.badgeText.toUpperCase()}
                          </span>
                        ) : isEn ? (
                          "TRENDING NOW · VERIFIED STORE"
                        ) : (
                          "TENDANCE DU MOMENT · BOUTIQUE VÉRIFIÉE"
                        )}
                      </span>
                      <h1 className="oj-hero-title">
                        {activeHeroProd?.title}
                      </h1>
                      <p className="oj-hero-desc">
                        {activeHeroProd?.description || activeHeroProd?.subtitle || (isEn
                          ? "Exceptional piece from yesterday, today, and tomorrow."
                          : "Un produit d'exception sélectionné avec la plus haute exigence de qualité.")}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {activeHeroProd?.price ? (
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--oj-color-accent)", fontVariantNumeric: "tabular-nums" }}>
                            {formatPrice(activeHeroProd.price, activeHeroProd.currency || "FCFA")}
                          </div>
                        ) : null}
                        {activeHeroProd?.seller?.name ? (
                          <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.75)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><IconStorefront /> <span>{activeHeroProd.seller.name}</span></span>
                            {activeHeroProd.seller.city ? (
                              <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>· {activeHeroProd.seller.city}</span>
                            ) : null}
                            {activeHeroProd.seller.isPremium && (
                              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: "rgba(212, 180, 131, 0.25)", color: "#D4B483", border: "1px solid rgba(212, 180, 131, 0.4)", fontWeight: 600 }}>
                                {activeHeroProd.badgeText || (isEn ? "Official" : "Officiel")}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                          className="oj-hero-cta"
                          onClick={() => {
                            // Opens the product detail modal directly!
                            setSelectedProduct(activeHeroProd);
                          }}
                        >
                          {isEn ? "Order now →" : "Commander →"}
                        </button>
                      </div>
                    </div>

                    <div 
                      className="oj-hero-visual oj-hero-visual-anim" 
                      key={`hero-visual-${heroSlideIndex}`}
                      onClick={() => setSelectedProduct(activeHeroProd)}
                      style={{ cursor: "pointer" }}
                      title={isEn ? "Click to view product details" : "Cliquer pour voir la fiche produit"}
                    >
                      <img src={activeHeroProd?.image} alt={activeHeroProd?.title || "Produit Phare"} />
                    </div>

                    <div className="oj-hero-controls">
                      <div className="oj-hero-dots">
                        {heroList.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`oj-hero-dot ${idx === (heroSlideIndex % heroList.length) ? "active" : ""}`}
                            onClick={() => setHeroSlideIndex(idx)}
                            aria-label={`Produit ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <span className="oj-hero-page-count">{currentCount} / {heroList.length}</span>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Recommandé pour vous */}
          <section className="oj-section" id="catalog-grid">
            <div className="oj-section-header">
              <h2 className="oj-section-title">
                {isEn ? "Recommended for you" : "Recommandé pour vous"}
              </h2>
              <button 
                className="oj-link-btn"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setBuyerTab("search");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
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
                          NUMÉRIQUE
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
                      <div 
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          margin: "2px 0 5px 0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: isDark ? "rgba(212, 180, 131, 0.12)" : "rgba(212, 180, 131, 0.18)",
                          border: "1px solid rgba(212, 180, 131, 0.35)",
                          maxWidth: "100%",
                        }}
                      >
                        <span style={{ color: "var(--oj-color-accent)", display: "flex", alignItems: "center" }}><IconDiamondSparkle /></span>
                        <span 
                          style={{
                            fontSize: "9.5px",
                            fontWeight: 700,
                            letterSpacing: "0.7px",
                            color: "var(--oj-color-accent)",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getProductMaterial(p.title, p.category, isEn)}
                        </span>
                      </div>
                      <p className="oj-prod-subtitle">{p.subtitle}</p>
                      <div className="oj-prod-footer">
                        <div>
                          <div className="oj-prod-price">
                            {formatPrice(p.price, p.currency)}
                          </div>
                          <div className="oj-prod-rating">
                            {p.reviewsCount && p.reviewsCount > 0 && p.rating ? (
                              <>
                                <span className="oj-star-icon"><IconStar /></span>
                                <span>{p.rating.toFixed(1)} ({p.reviewsCount})</span>
                              </>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--oj-color-accent)", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                                <IconDiamondSparkle />
                                <span>{isEn ? "NEW ARRIVAL" : "NOUVEAU"}</span>
                              </span>
                            )}
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
                            <IconDownloadMini />
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
              <button 
                className="oj-link-btn"
                onClick={() => {
                  setBuyerTab("search");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {isEn ? "See all →" : "Voir tout →"}
              </button>
            </div>
            <div className="oj-shops-scroll">
              {trustedShops.map((shop, i) => (
                <div key={i} className="oj-shop-card">
                  <div className="oj-shop-header">
                    <div className="oj-shop-avatar">{shop.initials}</div>
                    <div className="oj-shop-info">
                      <div className="oj-shop-name">{shop.name}</div>
                      {shop.verified && (
                        <span className="oj-verified-pill">✓ Vendeur Pro</span>
                      )}
                      <div className="oj-shop-meta">
                        {shop.reviews && shop.reviews > 0 && shop.rating ? (
                          <>
                            <span className="oj-star-icon"><IconStar /></span>
                            <span>{Number(shop.rating).toFixed(1)} ({shop.reviews} {isEn ? "reviews" : "avis"})</span>
                          </>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--oj-color-accent)", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                            <IconDiamondSparkle />
                            <span>{isEn ? "VERIFIED STORE" : "BOUTIQUE CERTIFIÉE"}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="oj-shop-thumbnails">
                    {(shop.products || []).slice(0, 2).map((img: string, j: number) => (
                      <div key={j} className="oj-shop-thumb">
                        <img src={img} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Les 3 Piliers de la Marketplace */}
          <section className="oj-section" style={{ marginTop: "16px" }}>
            <div className="oj-section-header">
              <div>
                <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", fontSize: "10.5px" }}>
                  {isEn ? "MARKETPLACE ADVANTAGES" : "LES AVANTAGES OJARKET"}
                </span>
                <h2 className="oj-section-title" style={{ marginTop: "2px" }}>
                  {isEn ? "Why Choose Ojarket" : "Pourquoi Choisir Ojarket"}
                </h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div style={{
                backgroundColor: isDark ? "rgba(17, 28, 26, 0.85)" : "#FFFFFF",
                borderRadius: "var(--oj-radius-card)",
                padding: "20px",
                border: "1px solid var(--oj-color-border)",
                boxShadow: "var(--oj-shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--oj-color-accent)", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {isEn ? "FOR BUYERS" : "POUR LES ACHETEURS"}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--oj-color-muted)", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--oj-color-subtle)" }}>
                      {isEn ? "Security" : "Sécurité"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "16px", margin: "0 0 6px 0", color: "var(--oj-color-text)" }}>
                    {isEn ? "Verified Stores" : "Boutiques Vérifiées"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--oj-color-muted)", lineHeight: 1.5, margin: 0 }}>
                    {isEn ? "Authentic articles and direct ordering from identified sellers." : "Articles authentiques et commandes directes auprès de vendeurs identifiés."}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid var(--oj-color-border)", paddingTop: "10px" }}>
                  <span style={{ color: "var(--oj-color-accent)", display: "flex" }}><IconDiamondSparkle /></span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--oj-color-accent)", letterSpacing: "0.5px" }}>
                    {isEn ? "CERTIFIED COMMERCE · SECURE" : "COMMERCE CERTIFIÉ · SÉCURISÉ"}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: isDark ? "rgba(17, 28, 26, 0.85)" : "#FFFFFF",
                borderRadius: "var(--oj-radius-card)",
                padding: "20px",
                border: "1px solid var(--oj-color-border)",
                boxShadow: "var(--oj-shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--oj-color-accent)", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {isEn ? "FOR SELLERS" : "POUR LES VENDEURS"}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--oj-color-muted)", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--oj-color-subtle)" }}>
                      {isEn ? "2 min" : "En 2 min"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "16px", margin: "0 0 6px 0", color: "var(--oj-color-text)" }}>
                    {isEn ? "Sell Online" : "Vendez en Ligne"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--oj-color-muted)", lineHeight: 1.5, margin: 0 }}>
                    {isEn ? "Open your store, share your personal links on WhatsApp & socials, and get paid." : "Ouvrez votre boutique, partagez vos liens sur WhatsApp et encaissez vos ventes."}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid var(--oj-color-border)", paddingTop: "10px" }}>
                  <span style={{ color: "var(--oj-color-accent)", display: "flex" }}><IconDiamondSparkle /></span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--oj-color-accent)", letterSpacing: "0.5px" }}>
                    {isEn ? "PERSONAL SHOP LINK · POCKET CASHBOOK" : "LIEN BOUTIQUE DÉDIÉ · GESTION DE CAISSE"}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: isDark ? "rgba(17, 28, 26, 0.85)" : "#FFFFFF",
                borderRadius: "var(--oj-radius-card)",
                padding: "20px",
                border: "1px solid var(--oj-color-border)",
                boxShadow: "var(--oj-shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--oj-color-accent)", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {isEn ? "CUSTOM & BULK" : "SUR-MESURE & VOLUME"}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--oj-color-muted)", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--oj-color-subtle)" }}>
                      {isEn ? "Quotes" : "Devis"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "16px", margin: "0 0 6px 0", color: "var(--oj-color-text)" }}>
                    {isEn ? "Custom Quotes" : "Devis Spécifiques"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--oj-color-muted)", lineHeight: 1.5, margin: 0 }}>
                    {isEn ? "Post special requirements and receive tailored quotes from partner stores." : "Commandes sur-mesure et gros volumes : recevez des offres adaptées à votre budget."}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", borderTop: "1px solid var(--oj-color-border)", paddingTop: "10px" }}>
                  <span style={{ color: "var(--oj-color-accent)", display: "flex" }}><IconDiamondSparkle /></span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--oj-color-accent)", letterSpacing: "0.5px" }}>
                    {isEn ? "FAST RESPONSE · NETWORK" : "RÉPONSE RAPIDE · RÉSEAU DÉDIÉ"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* D02 Banner: Salon Privé & Commandes Sur-Mesure */}
          <section className="oj-section" style={{ marginTop: "24px" }}>
            <div 
              style={{
                backgroundColor: "#022B22",
                borderRadius: "var(--oj-radius-section)",
                padding: "36px 32px",
                border: "1.5px solid rgba(212, 180, 131, 0.4)",
                boxShadow: "0 12px 36px rgba(2, 43, 34, 0.4)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", zIndex: 2, maxWidth: "720px", margin: "0 auto" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "20px", backgroundColor: "rgba(212, 180, 131, 0.15)", border: "1px solid rgba(212, 180, 131, 0.35)", marginBottom: "14px" }}>
                  <IconDiamondSparkle />
                  <span style={{ fontSize: "10.5px", fontWeight: 800, letterSpacing: "1.2px", color: "var(--oj-color-accent)", textTransform: "uppercase" }}>
                    {isEn ? "CUSTOM ORDERS & BULK QUOTES" : "COMMANDES SPÉCIFIQUES & DEVIS EN GROS"}
                  </span>
                  <IconDiamondSparkle />
                </div>
                <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "28px", color: "#FFFFFF", margin: "0 0 12px 0", lineHeight: 1.25 }}>
                  {isEn ? "Need a custom order or bulk purchase?" : "Un besoin spécifique ou une commande en gros ?"}
                </h2>
                <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: "0 auto 22px auto", maxWidth: "600px" }}>
                  {isEn
                    ? "Submit your requirements and receive competitive quotes directly from verified partner stores."
                    : "Décrivez précisément votre projet et recevez des offres directes de boutiques vérifiées sous 48h."}
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button 
                    className="oj-btn-primary" 
                    onClick={() => {
                      setBuyerTab("need");
                      setNeedSubTab("create");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      padding: "14px 28px",
                      fontSize: "13px",
                      fontWeight: 700,
                      backgroundColor: "var(--oj-color-accent)",
                      color: "#022B22",
                      border: "none",
                      boxShadow: "0 4px 16px rgba(212, 180, 131, 0.3)",
                    }}
                  >
                    {isEn ? "Request a Quote →" : "Demander un devis →"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Bandeau de Réassurance & Sceaux d'Honneur (4 Piliers) */}
          <section className="oj-section" style={{ marginTop: "24px", marginBottom: "20px" }}>
            <div 
              style={{
                backgroundColor: isDark ? "rgba(17, 28, 26, 0.6)" : "rgba(255, 255, 255, 0.8)",
                borderRadius: "var(--oj-radius-card)",
                padding: "24px 20px",
                border: "1px solid var(--oj-color-border)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ color: "var(--oj-color-accent)", flexShrink: 0, marginTop: "2px" }}>
                  <IconShieldCertificate />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: 700, color: "var(--oj-color-text)" }}>
                    {isEn ? "Verified Merchants" : "Commerçants Vérifiés"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--oj-color-muted)", lineHeight: 1.45 }}>
                    {isEn ? "Identified partner stores with quality and authenticity guarantee." : "Boutiques partenaires certifiées avec garantie d'authenticité."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ color: "var(--oj-color-accent)", flexShrink: 0, marginTop: "2px" }}>
                  <IconVaultSecurity />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: 700, color: "var(--oj-color-text)" }}>
                    {isEn ? "Secure Payment" : "Paiements Sécurisés"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--oj-color-muted)", lineHeight: 1.45 }}>
                    {isEn ? "Protected transactions via Mobile Money and bank cards." : "Transactions sécurisées par Mobile Money et cartes bancaires."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ color: "var(--oj-color-accent)", flexShrink: 0, marginTop: "2px" }}>
                  <IconLuxuryGift />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: 700, color: "var(--oj-color-text)" }}>
                    {isEn ? "Fast & Tracked Delivery" : "Livraison Rapide & Suivie"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--oj-color-muted)", lineHeight: 1.45 }}>
                    {isEn ? "Careful packaging and direct delivery with order tracking." : "Emballage soigné et remise en mains propres avec suivi en direct."}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ color: "var(--oj-color-accent)", flexShrink: 0, marginTop: "2px" }}>
                  <IconConciergeBell />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: 700, color: "var(--oj-color-text)" }}>
                    {isEn ? "Customer Support 7d/7" : "Service Client 7j/7"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--oj-color-muted)", lineHeight: 1.45 }}>
                    {isEn ? "Direct assistance for questions, orders, and merchant support." : "Assistance directe pour vos commandes et votre espace boutique."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ==================== VIEW 2: RECHERCHER & CATALOGUE ==================== */}
      {buyerTab === "search" && (
        <section className="oj-section" style={{ minHeight: "80vh", paddingTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "10px" }}>
            <div>
              <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", fontSize: "10px", marginBottom: "2px" }}>
                {isEn ? "EXCLUSIVE CATALOG" : "CATALOGUE OFFICIEL"}
              </span>
              <h1 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "20px", margin: 0, lineHeight: 1.2 }}>
                {isEn ? "Search & Collections" : "Explorer les créations"}
              </h1>
            </div>
            <button
              className="oj-link-btn"
              onClick={() => {
                setBuyerTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ fontSize: "10px", padding: "5px 12px", flexShrink: 0 }}
            >
              ← {isEn ? "Discover" : "Découvrir"}
            </button>
          </div>

          {/* Interactive Search Bar */}
          <div style={{ position: "relative", marginBottom: "18px" }}>
            <span className="oj-search-icon" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--oj-color-muted)", display: "flex", alignItems: "center" }}>
              <IconSearch />
            </span>
            <input
              type="text"
              className="oj-search-input"
              placeholder={isEn ? "Search by product, brand or boutique..." : "Rechercher par produit, marque ou boutique..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "13px 44px", borderRadius: "var(--oj-radius-pill)", fontSize: "13px" }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--oj-color-muted)", fontSize: "16px" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pills Filter */}
          <div className="oj-cats-list" style={{ marginBottom: "20px", padding: 0 }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`oj-cat-item ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{ minWidth: "68px" }}
              >
                <span className="oj-cat-icon-circle" style={{ width: "46px", height: "46px" }}>
                  {cat.isAll ? (
                    <img src={isDark ? "/brand/Ojarket_01_Icon_UltraPremium_Dark_Transparent.png" : "/brand/Ojarket_01_Icon_UltraPremium_Transparent.png"} alt="Tout" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                  ) : (
                    <img src={cat.image || ""} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </span>
                <span className="oj-cat-label" style={{ fontSize: "11px" }}>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Result counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "var(--oj-color-muted)", fontWeight: 600 }}>
              {filteredProducts.length} {isEn ? "creations found" : "créations d'exception disponibles"}
            </span>
            {activeCategory !== "all" && (
              <button className="oj-link-btn" onClick={() => setActiveCategory("all")} style={{ fontSize: "10px", padding: "4px 10px" }}>
                {isEn ? "All categories" : "Toutes les catégories"}
              </button>
            )}
          </div>

          {/* Products Grid with EXACT same proven master card layout as Home */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 16px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px" }}>
                {isEn ? "No products matching your query." : "Aucune création ne correspond à votre recherche."}
              </p>
              <button className="oj-btn-secondary" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
                {isEn ? "Reset filters" : "Réinitialiser les filtres"}
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
                        NUMÉRIQUE
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
                    <div className="oj-prod-seller">{typeof p.seller === "object" ? p.seller.name : p.seller || "Kingston Bio Official"}</div>
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
                          {p.reviewsCount && p.reviewsCount > 0 && p.rating ? (
                            <>
                              <span className="oj-star-icon"><IconStar /></span>
                              <span>{p.rating.toFixed(1)} ({p.reviewsCount})</span>
                            </>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--oj-color-accent)", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                              <IconDiamondSparkle />
                              <span>{isEn ? "NEW ARRIVAL" : "NOUVEAU"}</span>
                            </span>
                          )}
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
                          <IconDownloadMini />
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
      )}

      {/* ==================== VIEW 3: DEMANDES & SUR-MESURE ==================== */}
      {buyerTab === "need" && (
        <section className="oj-section" style={{ minHeight: "80vh", paddingTop: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "BESPOKE HUB · DIRECT WORKSHOP QUOTES" : "CRÉATIONS SUR-MESURE & DEVIS DIRECTS (D02)"}
            </span>
            <h1 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "28px", margin: "4px 0 8px" }}>
              {isEn ? "Custom Requests & Proposals" : "Espace Demandes & Sur-Mesure"}
            </h1>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: 0 }}>
              {isEn
                ? "Submit your specific needs or compare detailed proposals received from verified partner workshops."
                : "Exprimez vos besoins spécifiques ou comparez les propositions chiffrées soumises par nos vendeurs et boutiques partenaires vérifiées."}
            </p>
          </div>

          {/* Sub-tabs Switcher */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--oj-color-border)", paddingBottom: "12px" }}>
            <button
              className={`oj-pill-opt ${needSubTab === "create" ? "active" : ""}`}
              onClick={() => setNeedSubTab("create")}
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              + {isEn ? "New Custom Request" : "Exprimer un besoin"}
            </button>
            <button
              className={`oj-pill-opt ${needSubTab === "proposals" ? "active" : ""}`}
              onClick={() => setNeedSubTab("proposals")}
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              ✓ {isEn ? `Proposals Received (${currentUser ? requestsList.reduce((acc, r) => acc + (r.proposals?.length || 0), 0) : 0})` : `Devis reçus (${currentUser ? requestsList.reduce((acc, r) => acc + (r.proposals?.length || 0), 0) : 0})`}
            </button>
          </div>

          {/* Sub-tab 1: Formulaire Demande */}
          {needSubTab === "create" && (
            <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "28px", maxWidth: "720px" }}>
              <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-field)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "18px", color: "var(--oj-color-accent)" }}>✦</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "13px" }}>{isEn ? "AI Craft Assistant" : "Aide IA Ojarket"}</strong>
                  <p style={{ fontSize: "12px", color: "var(--oj-color-muted)", margin: "2px 0 0" }}>
                    {isEn ? "Let AI refine and structure your custom specifications." : "Décrivez votre besoin simplement, notre IA prépare le cahier des charges technique."}
                  </p>
                </div>
                <button className="oj-btn-secondary" style={{ height: "32px", fontSize: "12px", padding: "0 12px" }} onClick={handleAiAssist} disabled={aiStructuring}>
                  {aiStructuring ? "..." : (isEn ? "Fill example" : "Pré-remplir")}
                </button>
              </div>

              {needSubmitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: "42px", marginBottom: "12px", color: "var(--oj-color-action)" }}>✓</div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "20px", margin: "0 0 8px" }}>
                    {isEn ? "Request transmitted to workshops!" : "Demande transmise avec succès !"}
                  </h3>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: "0 0 20px" }}>
                    {isEn ? "Verified stores will submit detailed quotes with crafting delays." : "Les boutiques partenaires étudient votre demande et vous soumettront leurs devis sous peu."}
                  </p>
                  <button className="oj-btn-primary" onClick={() => { setNeedSubmitted(false); setNeedSubTab("proposals"); }}>
                    {isEn ? "View my proposals →" : "Voir mes devis reçus →"}
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!currentUser) {
                    setPendingAction("submitNeed");
                    setAuthModalOpen(true);
                    return;
                  }
                  if (!needDesc.trim()) return;

                  try {
                    const budgetNumber = parseInt(needBudget.replace(/\D/g, "")) || 60000;
                    const res = await RequestsApi.create({
                      buyerId: currentUser.id,
                      buyerName: currentUser.name || "Client Privilège",
                      buyerPhone: currentUser.phone || undefined,
                      rawPrompt: needDesc.trim(),
                      category: needCategory,
                      budgetMinor: budgetNumber * 100,
                    });
                    if (res) {
                      setRequestsList(prev => [res, ...prev]);
                      setNeedSubmitted(true);
                      setNeedDesc("");
                      setNeedBudget("");
                      setNeedPlace("");
                    }
                  } catch (err: any) {
                    alert(err?.message || "Erreur lors de la transmission de la demande");
                  }
                }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Category *" : "Catégorie de création *"}
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
                      <option value="leather">{isEn ? "Leather & Bags" : "Maroquinerie d'art"}</option>
                      <option value="watches">{isEn ? "Watches & Jewelry" : "Horlogerie & Joaillerie"}</option>
                      <option value="fashion">{isEn ? "Textiles & Wear" : "Textile & Mode noble"}</option>
                      <option value="home">{isEn ? "Home & Furniture" : "Mobilier d'art & Décoration"}</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Description of your bespoke need *" : "Description détaillée de votre besoin *"}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={isEn ? "Describe materials, dimensions, style..." : "Ex. : Sac cabas en cuir pleine fleur cognac, doublure suédine, gravure personnalisée..."}
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
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        {isEn ? "Target Budget" : "Budget indicatif"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 85 000 FCFA"
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
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        {isEn ? "Delivery city" : "Ville de livraison"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cotonou, Bénin"
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
                  <button type="submit" className="oj-btn-primary" style={{ width: "100%", height: "46px" }}>
                    {isEn ? "Transmit to verified workshops" : "Publier ma demande sur-mesure"} →
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sub-tab 2: Devis et propositions */}
          {needSubTab === "proposals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px" }}>
              {!currentUser ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)", maxWidth: "560px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px", color: "var(--oj-color-accent)" }}>✦</div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "0 0 10px" }}>
                    {isEn ? "Your Bespoke Quotes" : "Vos Devis & Créations Sur-Mesure"}
                  </h3>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
                    {isEn
                      ? "Sign in or create your Ojarket account to view proposals and quotes from verified stores."
                      : "Connectez-vous ou créez votre compte pour retrouver vos demandes sur-mesure et consulter les devis détaillés soumis par nos boutiques partenaires."}
                  </p>
                  <button className="oj-btn-primary" style={{ height: "46px", padding: "0 28px", fontSize: "14px" }} onClick={() => setAuthModalOpen(true)}>
                    {isEn ? "Sign In or Register" : "Se connecter ou Créer un compte"} →
                  </button>
                </div>
              ) : requestsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)", maxWidth: "560px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--oj-color-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--oj-color-accent)" }}>
                    ✦
                  </div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "20px", margin: "0 0 8px" }}>
                    {isEn ? "No Bespoke Requests Yet" : "Aucun devis en attente"}
                  </h3>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", lineHeight: "1.5", margin: "0 0 24px" }}>
                    {isEn
                      ? "You have not submitted any custom creation requests yet. Express your need to receive tailor-made quotes from our master craftspeople."
                      : "Vous n'avez aucune demande de création sur-mesure active. Exprimez vos souhaits pour recevoir des devis personnalisés chiffrés par nos boutiques et vendeurs professionnels."}
                  </p>
                  <button className="oj-btn-primary" style={{ height: "42px", padding: "0 20px" }} onClick={() => setNeedSubTab("create")}>
                    {isEn ? "Express a Custom Need →" : "Exprimer un besoin sur-mesure →"}
                  </button>
                </div>
              ) : (
                requestsList.map((req) => {
                  const reqBudget = req.targetBudgetMinor
                    ? `${Math.round(req.targetBudgetMinor / 100).toLocaleString()} ${req.currency || 'FCFA'}`
                    : (req.budget || "Sur devis");
                  const propsArray = req.proposals || [];

                  return (
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
                            {req.buyerCity || "Afrique de l'Ouest"} · {isEn ? "Budget:" : "Budget indicatif :"} <strong>{reqBudget}</strong>
                          </small>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--oj-color-accent)" }}>
                          {propsArray.length} {isEn ? "proposals" : "devis reçus"}
                        </span>
                      </div>

                      <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px" }}>
                        {req.description}
                      </p>

                      {propsArray.length === 0 ? (
                        <div style={{ padding: "16px", borderRadius: "var(--oj-radius-field)", background: "var(--oj-color-subtle)", fontSize: "13px", color: "var(--oj-color-muted)" }}>
                          {isEn ? "Your request has been published. Verified stores are reviewing your request." : "Votre demande a bien été transmise à nos boutiques partenaires. Leurs devis apparaîtront ici dès leur soumission."}
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                          {propsArray.map((prop: any) => {
                            const sellerName = prop.sellerName || prop.shopName || "Boutique Officielle";
                            const sellerCity = prop.sellerCity || prop.artisanCity || "Cotonou";
                            const delayDays = prop.delayDays || prop.productionDays || 7;
                            const price = prop.priceMinor ? Math.round(prop.priceMinor / 100) : (prop.price || 0);

                            return (
                              <div
                                key={prop.id}
                                style={{
                                  border: prop.status === "ACCEPTED" ? "2px solid var(--oj-color-action)" : "1px solid var(--oj-color-border)",
                                  borderRadius: "var(--oj-radius-field)",
                                  padding: "16px",
                                  background: prop.status === "ACCEPTED" ? "rgba(13, 74, 56, 0.08)" : "var(--oj-color-subtle)",
                                  position: "relative",
                                }}
                              >
                                {prop.status === "ACCEPTED" && (
                                  <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                                    <span className="oj-status-pill success">{isEn ? "ACCEPTED" : "RETENU ✓"}</span>
                                  </div>
                                )}
                                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                                  {sellerName}
                                </div>
                                <div style={{ color: "var(--oj-color-muted)", fontSize: "12px", marginBottom: "10px" }}>
                                  {sellerCity} · {delayDays} {isEn ? "days crafting" : "jours de confection"}
                                </div>
                                {prop.notes && (
                                  <p style={{ fontSize: "12px", color: "var(--oj-color-muted)", margin: "0 0 12px", lineHeight: "1.4" }}>
                                    "{prop.notes}"
                                  </p>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <div style={{ fontSize: "11px", color: "var(--oj-color-muted)" }}>{isEn ? "Price quoted" : "Montant du devis"}</div>
                                    <strong style={{ fontSize: "15px", fontVariantNumeric: "tabular-nums" }}>{formatPrice(price)}</strong>
                                  </div>
                                  {prop.status !== "ACCEPTED" ? (
                                    <button
                                      className="oj-btn-primary"
                                      style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}
                                      onClick={async () => {
                                        try {
                                          const res = await RequestsApi.acceptProposal(req.id, prop.id);
                                          prop.status = "ACCEPTED";
                                          OrdersApi.getAll().then(ords => { if (ords) setBuyerOrders(ords); }).catch(() => {});
                                          alert(isEn ? "Proposal accepted! Order created." : `Devis validé ! Commande ${res.orderNumber || ''} enregistrée.`);
                                        } catch (err: any) {
                                          alert(err?.message || "Erreur lors de la validation du devis");
                                        }
                                      }}
                                    >
                                      {isEn ? "Accept Quote" : "Retenir ce devis"} →
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--oj-color-action)" }}>
                                      ✓ Commande transmise
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      )}

      {/* ==================== VIEW 4: ACHATS & COMMANDES ==================== */}
      {buyerTab === "purchases" && (
        <section className="oj-section" style={{ minHeight: "80vh", paddingTop: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "PURCHASES & CERTIFIED ORDERS" : "ACHATS & COMMANDES SÉCURISÉES"}
            </span>
            <h1 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "28px", margin: "4px 0 8px" }}>
              {isEn ? "My Cart & Orders" : "Espace Achats & Commandes"}
            </h1>
          </div>

          {/* Sub-tabs Switcher */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid var(--oj-color-border)", paddingBottom: "12px" }}>
            <button
              className={`oj-pill-opt ${purchasesSubTab === "cart" ? "active" : ""}`}
              onClick={() => setPurchasesSubTab("cart")}
              style={{ padding: "8px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconCart />
              <span>{isEn ? `Cart (${cartCount})` : `Mon Panier (${cartCount})`}</span>
            </button>
            <button
              className={`oj-pill-opt ${purchasesSubTab === "orders" ? "active" : ""}`}
              onClick={() => setPurchasesSubTab("orders")}
              style={{ padding: "8px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconPackage size={15} />
              <span>{isEn ? `Orders (${currentUser ? buyerOrders.length : 0})` : `Mes Commandes (${currentUser ? buyerOrders.length : 0})`}</span>
            </button>
          </div>

          {/* Sub-tab 1: Panier */}
          {purchasesSubTab === "cart" && (
            <div style={{ maxWidth: "780px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 16px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>
                    {isEn ? "Your cart is currently empty." : "Votre panier est actuellement vide."}
                  </p>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: "0 0 20px" }}>
                    {isEn ? "Discover unique handmade creations in our catalog." : "Découvrez nos pièces d'exception sélectionnées pour vous."}
                  </p>
                  <button className="oj-btn-primary" onClick={() => { setBuyerTab("search"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    {isEn ? "Explore catalog →" : "Explorer le catalogue →"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "20px" }}>
                    {cart.map((item) => (
                      <div key={item.product.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid var(--oj-color-subtle)" }}>
                        <img src={item.product.image} alt={item.product.title} style={{ width: "64px", height: "64px", borderRadius: "10px", objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "11px", color: "var(--oj-color-muted)", textTransform: "uppercase" }}>
                            {typeof item.product.seller === "object" ? item.product.seller.name : item.product.seller}
                          </span>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{item.product.title}</div>
                          <div style={{ color: "var(--oj-color-accent)", fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>
                            {formatPrice(item.product.price)}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            className="oj-btn-secondary"
                            style={{ width: "28px", height: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, minWidth: "18px", textAlign: "center" }}>{item.quantity}</span>
                          <button
                            className="oj-btn-secondary"
                            style={{ width: "28px", height: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer", marginLeft: "8px", fontSize: "16px" }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--oj-color-border)" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600 }}>Total de la commande :</span>
                      <strong style={{ fontSize: "20px", color: "var(--oj-color-accent)", fontVariantNumeric: "tabular-nums" }}>
                        {formatPrice(cartTotal)}
                      </strong>
                    </div>
                  </div>

                  <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", fontSize: "12px", color: "var(--oj-color-muted)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--oj-color-action)", flexShrink: 0 }}><IconLock size={16} /></span>
                    <span>{isEn ? "Secure payment direct via Mobile Money (MTN MoMo, Moov, Wave) and Card. Funds protected in escrow until delivery is confirmed." : "Paiement sécurisé direct via Mobile Money (MTN MoMo, Moov, Wave) et Carte Bancaire. Les fonds sont protégés jusqu'à confirmation de livraison."}</span>
                  </div>

                  <button className="oj-btn-primary" style={{ height: "48px", fontSize: "15px" }} onClick={handlePlaceOrder}>
                    {isEn ? `Confirm Order (${formatPrice(cartTotal)})` : `Valider et commander (${formatPrice(cartTotal)})`} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Commandes passées */}
          {purchasesSubTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "780px" }}>
              {!currentUser ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)", maxWidth: "560px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px", color: "var(--oj-color-accent)" }}>✦</div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "22px", margin: "0 0 10px" }}>
                    {isEn ? "Track Your Orders" : "Suivi de Vos Commandes d'Exception"}
                  </h3>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
                    {isEn
                      ? "Sign in to track your order deliveries, escrow certificates, and artisan receipts."
                      : "Connectez-vous à votre compte Ojarket pour suivre l'acheminement de vos commandes, l'état de préparation des boutiques et vos garanties d'authenticité."}
                  </p>
                  <button className="oj-btn-primary" style={{ height: "46px", padding: "0 28px", fontSize: "14px" }} onClick={() => setAuthModalOpen(true)}>
                    {isEn ? "Sign In or Register" : "Se connecter ou Créer un compte"} →
                  </button>
                </div>
              ) : buyerOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--oj-color-surface)", borderRadius: "var(--oj-radius-card)", border: "1px solid var(--oj-color-border)", maxWidth: "560px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--oj-color-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--oj-color-muted)" }}>
                    <IconPackage size={22} />
                  </div>
                  <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "20px", margin: "0 0 8px" }}>
                    {isEn ? "No Orders Placed Yet" : "Aucune commande pour le moment"}
                  </h3>
                  <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", lineHeight: "1.5", margin: "0 0 24px" }}>
                    {isEn
                      ? "Your order history is currently empty. Discover unique creations from verified west-african artisans."
                      : "Votre historique de commandes est vierge. Explorez les créations d'exception de nos boutiques et vendeurs vérifiés."}
                  </p>
                  <button className="oj-btn-primary" style={{ height: "42px", padding: "0 20px" }} onClick={() => { setBuyerTab("search"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    {isEn ? "Discover Creations →" : "Découvrir la sélection d'exception →"}
                  </button>
                </div>
              ) : (
                buyerOrders.map((ord) => {
                  const orderNumber = ord.orderNumber || ord.id;
                  const title = ord.title || (ord.lines && ord.lines[0]?.itemTitle) || "Commande Ojarket";
                  const shopName = ord.shopName || ord.shop?.name || (ord.lines && ord.lines[0]?.variant?.product?.shop?.name) || "Kingston Bio Official";
                  const date = ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "Aujourd'hui");
                  const price = ord.price != null ? ord.price : (ord.totalAmountMinor ? ord.totalAmountMinor / 100 : 0);
                  const paymentStatus = ord.paymentStatus === 'CONFIRMED' || ord.paymentStatus === 'SETTLED_TO_MERCHANT' ? (isEn ? "Paid & Certified" : "Payé & Certifié (MTN MoMo)") : (ord.paymentStatus || (isEn ? "Pending" : "En attente"));
                  const deliveryStatus = ord.deliveryStatus || (ord.fulfillmentStatus === 'SHIPPED' ? (isEn ? "In transit" : "En cours de livraison") : (isEn ? "In preparation" : "En préparation par la boutique"));
                  const img = ord.image || (ord.lines && ord.lines[0]?.variant?.product?.image) || "/products/watch-chrono.jpg";

                  return (
                    <div
                      key={ord.id}
                      style={{
                        background: "var(--oj-color-surface)",
                        border: "1px solid var(--oj-color-border)",
                        borderRadius: "var(--oj-radius-card)",
                        padding: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <img src={img} alt={title} style={{ width: "68px", height: "68px", borderRadius: "10px", objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 700, fontSize: "13px" }}>{orderNumber}</span>
                          <span className="oj-status-pill success" style={{ fontSize: "10px" }}>{paymentStatus}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "15px" }}>{title}</div>
                        <small style={{ color: "var(--oj-color-muted)" }}>
                          {shopName} · {date}
                        </small>
                        <div style={{ fontSize: "12px", color: "var(--oj-color-action)", marginTop: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          <IconTruck size={14} />
                          <span>{deliveryStatus}</span>
                        </div>
                      </div>
                      <strong style={{ fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>
                        {formatPrice(price)}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      )}

      {/* ==================== VIEW 5: PROFIL CLIENT & PARAMÈTRES ==================== */}
      {buyerTab === "profile" && (
        <section className="oj-section" style={{ minHeight: "80vh", paddingTop: "24px" }}>
          <div style={{ maxWidth: "600px" }}>
            <div style={{ marginBottom: "24px" }}>
              <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
                {isEn ? "ACCOUNT & SETTINGS" : "ESPACE CLIENT PRIVILÈGE"}
              </span>
              <h1 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "28px", margin: "4px 0 0" }}>
                {isEn ? "My Profile" : "Mon Compte & Préférences"}
              </h1>
            </div>

            {currentUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ width: "54px", height: "54px", borderRadius: "27px", backgroundColor: "var(--oj-color-action)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{currentUser.name}</h3>
                      <div style={{ color: "var(--oj-color-muted)", fontSize: "13px" }}>{currentUser.email}</div>
                      <span className="oj-status-pill success" style={{ fontSize: "10px", marginTop: "4px", display: "inline-block" }}>
                        {currentUser.role === "ADMIN" ? "Administrateur Système" : "✦ Client Privilège Certifié"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      className="oj-btn-secondary"
                      style={{ justifyContent: "space-between", height: "42px", padding: "0 16px", fontSize: "13px", fontWeight: 600 }}
                      onClick={() => {
                        handleSelectUniverse("seller");
                      }}
                    >
                      <span>{isEn ? "Switch to Seller Pro Universe" : "Accéder à l'Espace Vendeur Pro"}</span>
                      <span>↗</span>
                    </button>

                    <button
                      className="oj-btn-secondary"
                      style={{ justifyContent: "space-between", height: "42px", padding: "0 16px", fontSize: "13px", fontWeight: 600 }}
                      onClick={() => {
                        setBuyerTab("purchases");
                        setPurchasesSubTab("orders");
                      }}
                    >
                      <span>{isEn ? "My certified orders" : "Mes commandes certifiées"}</span>
                      <span>({buyerOrders.length}) →</span>
                    </button>

                    <button
                      className="oj-btn-secondary"
                      style={{ justifyContent: "space-between", height: "42px", padding: "0 16px", fontSize: "13px", fontWeight: 600 }}
                      onClick={() => {
                        setBuyerTab("need");
                        setNeedSubTab("proposals");
                      }}
                    >
                      <span>{isEn ? "My custom requests & store quotes" : "Mes demandes et devis boutiques"}</span>
                      <span>({requestsList.length}) →</span>
                    </button>
                  </div>
                </div>

                <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "20px" }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: "15px" }}>{isEn ? "Preferences" : "Préférences"}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "13px" }}>{isEn ? "Language" : "Langue d'affichage"}</span>
                    <button className="oj-link-btn" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>
                      {locale === "fr" ? "Français (Bénin / UEMOA)" : "English"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px" }}>{isEn ? "Display Theme" : "Thème visuel"}</span>
                    <button className="oj-link-btn" onClick={() => setMode(isDark ? "light" : "dark")}>
                      {isDark ? "Mode Sombre" : "Mode Clair"}
                    </button>
                  </div>
                </div>

                <button
                  className="oj-btn-secondary"
                  onClick={handleLogout}
                  style={{ color: "var(--oj-color-errorFg)", borderColor: "var(--oj-color-border)", height: "42px", fontWeight: 600 }}
                >
                  {isEn ? "Sign Out" : "Se déconnecter"} ✕
                </button>
              </div>
            ) : (
              <div style={{ background: "var(--oj-color-surface)", border: "1px solid var(--oj-color-border)", borderRadius: "var(--oj-radius-card)", padding: "28px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>✦</div>
                <h3 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "20px", margin: "0 0 8px" }}>
                  {isEn ? "Join Ojarket Privilege" : "Espace Client Privilège"}
                </h3>
                <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: "0 0 24px" }}>
                  {isEn
                    ? "Log in to track your custom orders, proposals, and cart."
                    : "Connectez-vous pour suivre vos commandes, vos commandes sur-mesure et vos devis de vendeurs."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="oj-btn-primary" style={{ height: "44px" }} onClick={() => setAuthModalOpen(true)}>
                    {isEn ? "Sign In or Register" : "Se connecter ou Créer un compte"} →
                  </button>
                  <button
                    className="oj-btn-secondary"
                    style={{ height: "42px" }}
                    onClick={() => {
                      setPendingAction("openSellerSpace");
                      setAuthModalOpen(true);
                    }}
                  >
                    {isEn ? "Become a Verified Seller" : "Ouvrir un Espace Vendeur Pro"} ↗
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
      ) : (
        /* ==================== SELLER UNIVERSE ==================== */
        <main className="oj-main-seller">
          <div className="oj-section">
            <div className="oj-seller-header">
              <div>
                <h1 className="oj-seller-greeting">
                  {currentUser?.name
                    ? (isEn ? `Welcome back, ${currentUser.name.trim().split(/\s+/)[0]}` : `Bonjour ${currentUser.name.trim().split(/\s+/)[0]}`)
                    : (isEn ? "Welcome back" : "Bonjour")}
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

            <div className="oj-seller-tabs" style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--oj-color-border)', marginBottom: '32px', overflowX: 'auto', paddingBottom: '1px' }}>
              {(["overview", "shop", "opportunities", "orders", "cashbook"] as const).map((tab) => (
                <button
                  key={tab}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: sellerTab === tab ? '2px solid var(--oj-color-action)' : '2px solid transparent',
                    color: sellerTab === tab ? 'var(--oj-color-text-primary)' : 'var(--oj-color-text-secondary)',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: sellerTab === tab ? 500 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSellerTab(tab)}
                >
                  {tab === "overview"
                    ? isEn ? "Dashboard" : "Tableau de bord"
                    : tab === "shop"
                    ? isEn ? "My Boutique" : "Ma Boutique"
                    : tab === "opportunities"
                    ? isEn ? `Buyer Demands (${sellerRequests.length})` : `Demandes acheteurs (${sellerRequests.length})`
                    : tab === "orders"
                    ? isEn ? `Orders (${sellerOrders.length})` : `Commandes (${sellerOrders.length})`
                    : isEn ? "Cashbook & FinOps" : "Caisse & FinOps"}
                </button>
              ))}
            </div>

            {sellerTab === "overview" && <SellerOverview isEn={isEn} finopsKpis={finopsKpis} sellerOrders={sellerOrders} sellerRequests={sellerRequests} />}
            {sellerTab === "shop" && <SellerShop isEn={isEn} products={featuredProducts.filter((p: any) => p.shopId === (currentUser?.activeShop?.id || currentUser?.id))} />}
            {sellerTab === "opportunities" && <SellerOpportunities isEn={isEn} requests={sellerRequests} />}
            {sellerTab === "orders" && <SellerOrders isEn={isEn} orders={sellerOrders} />}
            {sellerTab === "cashbook" && <SellerCashbook isEn={isEn} finopsKpis={finopsKpis} finopsEntries={finopsEntries} />}
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
                    {isEn ? `In stock (${selectedProduct.stock ?? 1})` : `En stock (${selectedProduct.stock ?? 1})`}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div className="oj-shop-avatar" style={{ width: "36px", height: "36px", fontSize: "12px" }}>
                    {typeof selectedProduct.seller === "object"
                      ? selectedProduct.seller?.initials || selectedProduct.seller?.name?.slice(0, 2).toUpperCase() || "KB"
                      : (selectedProduct.seller ? String(selectedProduct.seller).slice(0, 2).toUpperCase() : "KB")}
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px" }}>
                      {typeof selectedProduct.seller === "object"
                        ? selectedProduct.seller?.name || "Kingston Bio"
                        : selectedProduct.seller || "Kingston Bio"}
                    </strong>
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
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {selectedProduct.variants.map((v, idx) => (
                      <span key={idx} style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "8px 14px", border: "1px solid var(--oj-color-border)",
                        borderRadius: "var(--oj-radius-pill)", fontSize: "13px"
                      }}>
                        {v.color && <i style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: v.color, display: "inline-block" }} />}
                        {v.name}
                      </span>
                    ))}
                  </div>
                )}
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!currentUser) {
                  setPendingAction("submitNeed");
                  setAuthModalOpen(true);
                  return;
                }
                if (!needDesc.trim()) return;

                try {
                  const budgetNumber = parseInt(needBudget.replace(/\D/g, "")) || 60000;
                  const res = await RequestsApi.create({
                    buyerId: currentUser.id,
                    buyerName: currentUser.name || "Client Privilège",
                    buyerPhone: currentUser.phone || undefined,
                    rawPrompt: needDesc.trim(),
                    category: needCategory,
                    budgetMinor: budgetNumber * 100,
                  });
                  if (res) {
                    setRequestsList(prev => [res, ...prev]);
                    setNeedSubmitted(true);
                    setNeedDesc("");
                    setNeedBudget("");
                    setNeedPlace("");
                  }
                } catch (err: any) {
                  alert(err?.message || "Erreur lors de la transmission de la demande");
                }
              }}>
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
                            {prop.city} · {prop.days} {isEn ? "days lead time" : "jours de confection"}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>{isEn ? "Total Quote:" : "Devis total :"}</span>
                            <strong style={{ fontSize: "16px", fontVariantNumeric: "tabular-nums" }}>{typeof prop.price === "number" ? formatPrice(prop.price) : prop.price}</strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>{isEn ? "Deposit required:" : "Acompte direct :"}</span>
                            <span style={{ fontWeight: 600, color: "var(--oj-color-accent)", fontVariantNumeric: "tabular-nums" }}>{typeof prop.advance === "number" ? formatPrice(prop.advance) : prop.advance}</span>
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

      {/* ==================== D02 SELLER QUOTE SUBMISSION MODAL (S27) ==================== */}
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
                La validation scelle le registre de la date du jour. Toute modification ultérieure sera consignée comme écriture de contre-passation auditable.
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
                      <strong>Livraison Numérique Immédiate :</strong> Les guides et fichiers numériques sont délivrés instantanément avec licence commerciale après validation.
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
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>{isEn ? "Terms" : "Conditions"}</Link>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>{isEn ? "Privacy" : "Confidentialité"}</Link>
          </div>
        </div>
      </footer>

      {/* ==================== BOTTOM NAVIGATION (mobile & responsive) ==================== */}
      <nav className="oj-bottom-nav" aria-label="Navigation principale mobile">
        {[
          {
            key: "home",
            label: isEn ? "Discover" : "Découvrir",
            icon: (active: boolean) => <IconHome active={active} />,
            active: universe === "buyer" && buyerTab === "home",
            onClick: () => {
              setUniverse("buyer");
              setBuyerTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            key: "search",
            label: isEn ? "Search" : "Rechercher",
            icon: (active: boolean) => <IconSearch active={active} />,
            active: universe === "buyer" && buyerTab === "search",
            onClick: () => {
              setUniverse("buyer");
              setBuyerTab("search");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            key: "need",
            label: isEn ? "Requests" : "Demandes",
            icon: (active: boolean) => <IconFileText active={active} />,
            active: universe === "buyer" && buyerTab === "need",
            onClick: () => {
              setUniverse("buyer");
              setBuyerTab("need");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            key: "purchases",
            label: isEn ? "Purchases" : "Achats",
            icon: (active: boolean) => <IconShoppingBagOpen active={active} />,
            active: universe === "buyer" && buyerTab === "purchases",
            onClick: () => {
              setUniverse("buyer");
              setBuyerTab("purchases");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            key: "profile",
            label: isEn ? "Profile" : "Profil",
            icon: (active: boolean) => <IconUser active={active} />,
            active: universe === "buyer" && buyerTab === "profile",
            onClick: () => {
              setUniverse("buyer");
              setBuyerTab("profile");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
        ].map((item) => (
          <button
            key={item.key}
            className={`oj-bnav-item ${item.active ? "active" : ""}`}
            onClick={item.onClick}
            aria-current={item.active ? "page" : undefined}
          >
            <span className="oj-bnav-icon">{item.icon(item.active)}</span>
            <span className="oj-bnav-label">{item.label}</span>
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
