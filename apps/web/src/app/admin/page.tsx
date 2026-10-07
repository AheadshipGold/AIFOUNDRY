"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Locale } from "@aifoundry/shared";
import "../../design-system/styles.css";
import "../landing.css";
import { AuthApi, getStoredToken, getStoredUser, clearSession, type AuthUser } from "../../lib/api";

export type AuthSessionUser = AuthUser;

interface CorridorRule {
  id: string;
  country: string;
  countryCode: string;
  currency: string;
  channel: string;
  isEnabled: boolean;
  minAmountMinor: number;
  maxAmountMinor: number;
  kycRequired: string;
  contractVerified: boolean;
}

interface ShopReview {
  id: string;
  name: string;
  owner: string;
  city: string;
  country: string;
  craft: string;
  status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED";
  joinedDate: string;
  salesCount: number;
  documentType: string;
}

interface DisputeItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  reporterName: string;
  reporterPhone?: string;
  category: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: "OPEN" | "UNDER_REVIEW" | "PROPOSAL_MADE" | "RESOLVED" | string;
  proposedOutcome?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  operator: string;
  role: string;
  time: string;
  ip: string;
  status: "SUCCESS" | "BLOCKED" | "REVIEW";
  hash?: string;
  previousHash?: string;
}

interface SealedAuditReport {
  id: string;
  reportPeriod: string;
  generatedAt: string;
  totalEventsCount: number;
  totalOrdersVolumeMinor: number;
  activeShopsCount: number;
  resolvedDisputesCount: number;
  activeCorridorsCount: number;
  merkleRootHash: string;
  isCryptographicallySealed: boolean;
  signatureSeal: string;
}

interface ChainIntegrityResult {
  isValid: boolean;
  totalBlocks: number;
  genesisHash: string;
  latestHash: string;
  verifiedAt: string;
}


function AdminIconGavel({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M14 13l5 5m-5-5l-4-4 5-5 4 4-5 5z" />
      <path d="M3 21h18" />
      <path d="M16 11l2 2" />
      <path d="M6 14l3 3" />
    </svg>
  );
}

function AdminIconLock({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function AdminIconCrown({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M2 4l3 12h14l3-12-5 6-5-6-5 6z" />
    </svg>
  );
}

function AdminIconBarChart({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function AdminIconStore({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function AdminIconCoin({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 1.5 5 4a2.5 2.5 0 0 1-5 0" />
    </svg>
  );
}

function AdminIconShield({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function AdminIconPalette({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="13.5" cy="6.5" r=".5" fill={color} />
      <circle cx="17.5" cy="10.5" r=".5" fill={color} />
      <circle cx="8.5" cy="7.5" r=".5" fill={color} />
      <circle cx="6.5" cy="12.5" r=".5" fill={color} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H17c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-11-8.6z" />
    </svg>
  );
}

function AdminIconUsers({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AdminIconSearch({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function AdminIconFileText({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function AdminIconAlertTriangle({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function AdminPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<
    "overview" | "shops" | "corridors" | "d02" | "disputes" | "finops" | "audit" | "cms" | "admins"
  >("overview");

  // CMS State
  const [cmsConfig, setCmsConfig] = useState<any>(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsSaving, setCmsSaving] = useState(false);

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);

  // Admin Session & Security Gate State
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Filters
  const [shopSearch, setShopSearch] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("ALL");
  const [corridorSearch, setCorridorSearch] = useState("");

  // Disputes & Arbitration State (A04)
  const [disputes, setDisputes] = useState<DisputeItem[]>([
    {
      id: "inc-01",
      orderId: "cmd-mock-01",
      orderNumber: "CMD-2847",
      reporterName: "Amina Diop",
      reporterPhone: "+229 97 00 11 22",
      category: "DELAY_EXCEEDED",
      title: "Retard de livraison sur Cotonou",
      description: "La commande devait être livrée sous 10 jours. Demande de clarification auprès de la boutique.",
      evidenceUrls: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80"],
      status: "UNDER_REVIEW",
      proposedOutcome: "Remplacement prioritaire sous 48h et geste commercial de 10 000 FCFA.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [disputeFilter, setDisputeFilter] = useState<string>("ALL");
  const [disputeLoading, setDisputeLoading] = useState(false);

  // Audit Logs & Hash-Chain State (A07)
  const [auditLoading, setAuditLoading] = useState(false);
  const [chainIntegrity, setChainIntegrity] = useState<ChainIntegrityResult | null>(null);
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [auditReports, setAuditReports] = useState<SealedAuditReport[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  const isDark = theme === "dark";
  const isEn = locale === "en";

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
        })
        .finally(() => {
          setAuthChecked(true);
        });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await AuthApi.loginWithEmail(loginEmail, loginPasscode);
      if (res.user.role !== "ADMIN") {
        setLoginError(
          isEn
            ? "Access denied. Administrator privileges required."
            : "Accès refusé. Privilèges Administrateur requis."
        );
        return;
      }
      setCurrentUser(res.user);
    } catch (err: any) {
      setLoginError(
        err.message ||
          (isEn
            ? "Invalid administrative credentials."
            : "Identifiants administratifs non reconnus.")
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    AuthApi.logout();
    setCurrentUser(null);
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (activeNav === "cms" && !cmsConfig) {
      setCmsLoading(true);
      fetch(`${apiBase}/v1/cms/landing`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      })
      .then(r => r.json())
      .then(data => setCmsConfig(data))
      .catch(console.error)
      .finally(() => setCmsLoading(false));
    }
    if (activeNav === "disputes") {
      setDisputeLoading(true);
      fetch(`${apiBase}/v1/incidents`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDisputes(data);
          }
        })
        .catch(() => {})
        .finally(() => setDisputeLoading(false));
    }
    if (activeNav === "audit") {
      setAuditLoading(true);
      fetch(`${apiBase}/v1/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAuditLogs(data.map(d => ({
            id: d.id,
            action: d.action,
            target: `${d.targetResource} (${d.targetId})`,
            operator: d.adminName,
            role: d.adminRole,
            time: new Date(d.createdAt).toLocaleString(locale === "en" ? "en-US" : "fr-FR"),
            ip: d.ipAddress,
            status: "SUCCESS",
            hash: d.hash,
            previousHash: d.previousHash,
          })));
        }
      })
      .catch(console.error)
      .finally(() => setAuditLoading(false));

      fetch(`${apiBase}/v1/admin/audit/reports`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) setAuditReports(data);
      })
      .catch(console.error);
    }
    if (activeNav === "admins" && adminUsers.length === 0) {
      setAdminLoading(true);
      fetch(`${apiBase}/v1/admin/users`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      })
      .then(r => r.json())
      .then(data => setAdminUsers(data))
      .catch(console.error)
      .finally(() => setAdminLoading(false));
    }
  }, [activeNav]);

  const handleSaveCms = async () => {
    setCmsSaving(true);
    try {
      const res = await fetch(`${apiBase}/v1/cms/landing`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify(cmsConfig)
      });
      if (res.ok) alert(isEn ? "CMS Config Saved!" : "Configuration CMS sauvegardée !");
      else alert("Error saving CMS Config");
    } catch (e) {
      console.error(e);
      alert("Error saving CMS Config");
    } finally {
      setCmsSaving(false);
    }
  };

  const handlePromoteAdmin = async () => {
    if (!newAdminEmail) return;
    setAdminSaving(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/users/create`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ email: newAdminEmail, name: newAdminName })
      });
      if (res.ok) {
        alert(isEn ? "Admin created successfully!" : "Administrateur créé avec succès !");
        // refresh admins
        const data = await fetch(`${apiBase}/v1/admin/users`, {
          headers: { Authorization: `Bearer ${getStoredToken()}` }
        }).then(r => r.json());
        setAdminUsers(data);
        setNewAdminEmail("");
        setNewAdminName("");
      } else {
        alert("Error creating admin");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating admin");
    } finally {
      setAdminSaving(false);
    }
  };

  const [corridors, setCorridors] = useState<CorridorRule[]>([
    {
      id: "corr-01",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "MTN Mobile Money Direct",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 500000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-02",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "Moov Money Direct",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 300000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-03",
      country: "Bénin",
      countryCode: "BJ",
      currency: "XOF",
      channel: "Celtiis Cash",
      isEnabled: true,
      minAmountMinor: 10000,
      maxAmountMinor: 200000000,
      kycRequired: "Standard",
      contractVerified: true,
    },
    {
      id: "corr-04",
      country: "Côte d'Ivoire",
      countryCode: "CI",
      currency: "XOF",
      channel: "Wave / Orange Money",
      isEnabled: false,
      minAmountMinor: 50000,
      maxAmountMinor: 1000000000,
      kycRequired: "Renforcé (KYB)",
      contractVerified: false,
    },
    {
      id: "corr-05",
      country: "Togo",
      countryCode: "TG",
      currency: "XOF",
      channel: "T-Money Direct",
      isEnabled: false,
      minAmountMinor: 20000,
      maxAmountMinor: 400000000,
      kycRequired: "Standard",
      contractVerified: false,
    },
    {
      id: "corr-06",
      country: "International",
      countryCode: "INT",
      currency: "EUR/USD",
      channel: "Stripe Gateway Vendeur",
      isEnabled: false,
      minAmountMinor: 100000,
      maxAmountMinor: 5000000000,
      kycRequired: "Passeport + RCCM",
      contractVerified: false,
    },
  ]);

  const [shops, setShops] = useState<ShopReview[]>([
    {
      id: "shop-01",
      name: "Maison Laurent & Ganvié",
      owner: "Laurent Ganvié",
      city: "Cotonou",
      country: "Bénin",
      craft: "Maroquinerie d'Art",
      status: "VERIFIED",
      joinedDate: "12 Sep 2026",
      salesCount: 142,
      documentType: "RCCM + Registre du Commerce",
    },
    {
      id: "shop-02",
      name: "Fonderie Royale d'Abomey",
      owner: "Dah Kpassè",
      city: "Abomey",
      country: "Bénin",
      craft: "Bronze & Fonderie",
      status: "VERIFIED",
      joinedDate: "15 Sep 2026",
      salesCount: 88,
      documentType: "Registre de Commerce + RCCM",
    },
    {
      id: "shop-03",
      name: "Studio Djoliba Horlogerie",
      owner: "Amadou Touré",
      city: "Bamako",
      country: "Mali",
      craft: "Horlogerie & Montres",
      status: "PENDING_KYC",
      joinedDate: "28 Sep 2026",
      salesCount: 14,
      documentType: "Passeport + Bail commercial",
    },
    {
      id: "shop-04",
      name: "Maison Indigo Ouidah",
      owner: "Safiath Dossou",
      city: "Ouidah",
      country: "Bénin",
      craft: "Mode & Tissage Végétal",
      status: "PENDING_KYC",
      joinedDate: "29 Sep 2026",
      salesCount: 3,
      documentType: "Carte Nationale d'Identité + Photos de boutique",
    },
    {
      id: "shop-05",
      name: "Ébénisterie Sacrée Dassa",
      owner: "Koffi Mensah",
      city: "Dassa",
      country: "Bénin",
      craft: "Sculpture Bois d'Iroko",
      status: "SUSPENDED",
      joinedDate: "04 Août 2026",
      salesCount: 31,
      documentType: "Dossier incomplet (re-contrôle)",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      id: "aud-01",
      action: "CORRIDOR_VERIFIED",
      target: "Bénin MTN MoMo Direct",
      operator: "platform_owner",
      role: "SUPERADMIN",
      time: "Aujourd'hui 02:20",
      ip: "192.168.1.42",
      status: "SUCCESS",
    },
    {
      id: "aud-02",
      action: "KYC_APPROVED",
      target: "Maison Laurent & Ganvié",
      operator: "merchant_reviewer",
      role: "COMPLIANCE",
      time: "Hier 23:45",
      ip: "10.0.4.11",
      status: "SUCCESS",
    },
    {
      id: "aud-03",
      action: "DENY_BY_DEFAULT_ENFORCED",
      target: "Wave / Orange CI (sans contrat)",
      operator: "system_security_gate",
      role: "AUTOMATION",
      time: "30/09/2026 21:15",
      ip: "127.0.0.1",
      status: "BLOCKED",
    },
    {
      id: "aud-04",
      action: "DAY_CLOSURE_SEALED",
      target: "Caisse Boutique #042 Alexandre",
      operator: "finops_engine",
      role: "AUDIT_LEDGER",
      time: "30/09/2026 19:00",
      ip: "10.0.8.2",
      status: "SUCCESS",
    },
  ]);

  const handleVerifyChainIntegrity = async () => {
    setVerifyingChain(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/audit/verify-chain`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChainIntegrity(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleGenerateAuditReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/audit/reports/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ periodName: "Hebdomadaire Instantané" })
      });
      if (res.ok) {
        const newReport = await res.json();
        setAuditReports(prev => [newReport, ...prev.filter(r => r.id !== newReport.id)]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleArbitrateDispute = async (id: string, resolution: string, proposedOutcome?: string) => {
    try {
      await fetch(`${apiBase}/v1/incidents/${id}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, proposedOutcome }),
      });
    } catch {}

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "RESOLVED",
              resolution,
              proposedOutcome: proposedOutcome || d.proposedOutcome,
              resolvedAt: new Date().toISOString(),
            }
          : d
      )
    );

    setAuditLogs((a) => [
      {
        id: `aud-${Date.now()}`,
        action: "DISPUTE_ARBITRATED_RESOLVED",
        target: `Litige #${id} (${resolution})`,
        operator: currentUser?.name || "platform_owner",
        role: "SUPERADMIN",
        time: "À l'instant",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
      ...a,
    ]);
  };

  const toggleCorridor = (id: string) => {
    setCorridors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (!c.contractVerified && !c.isEnabled) {
            alert(
              isEn
                ? "Deny by Default Rule: Cannot activate corridor without verified legal and partner contract agreement."
                : "Règle Deny by Default : activation impossible sans contrat légal et convention partenaire vérifiée."
            );
            return c;
          }
          const nextState = !c.isEnabled;
          // Add audit entry
          setAuditLogs((a) => [
            {
              id: `aud-${Date.now()}`,
              action: nextState ? "CORRIDOR_ACTIVATED" : "CORRIDOR_DEACTIVATED",
              target: `${c.country} ${c.channel}`,
              operator: "platform_owner",
              role: "SUPERADMIN",
              time: "À l'instant",
              ip: "127.0.0.1",
              status: "SUCCESS",
            },
            ...a,
          ]);
          return { ...c, isEnabled: nextState };
        }
        return c;
      })
    );
  };

  const updateShopStatus = (
    id: string,
    status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED"
  ) => {
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    setAuditLogs((a) => [
      {
        id: `aud-${Date.now()}`,
        action: `SHOP_STATUS_${status}`,
        target: `Boutique #${id}`,
        operator: "platform_owner",
        role: "SUPERADMIN",
        time: "À l'instant",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
      ...a,
    ]);
  };

  const formatPrice = (val: number, cur = "XOF") => {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(val) + ` ${cur}`;
  };

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      shopSearch === "" ||
      s.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.owner.toLowerCase().includes(shopSearch.toLowerCase()) ||
      s.city.toLowerCase().includes(shopSearch.toLowerCase());
    const matchesFilter =
      shopFilter === "ALL" || s.status === shopFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCorridors = corridors.filter((c) => {
    return (
      corridorSearch === "" ||
      c.country.toLowerCase().includes(corridorSearch.toLowerCase()) ||
      c.channel.toLowerCase().includes(corridorSearch.toLowerCase())
    );
  });

  const pendingKycsCount = shops.filter((s) => s.status === "PENDING_KYC").length;
  const openDisputesCount = disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW" || d.status === "PROPOSAL_MADE").length;
  const activeCorridorsCount = corridors.filter((c) => c.isEnabled).length;

  // Render Luxury Security Gate Wall if unauthenticated or not an admin
  if (authChecked && (!currentUser || currentUser.role !== "ADMIN")) {
    return (
      <div
        className={`oj-admin-app ${isDark ? "theme-dark" : "theme-light"}`}
        data-theme={theme}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--oj-color-bg)",
        }}
      >
        {/* Gate Topbar */}
        <header className="oj-admin-topbar" style={{ justifyContent: "space-between" }}>
          <Link href="/" className="oj-admin-brand-wrap">
            <img
              src={
                isDark
                  ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                  : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"
              }
              alt="Ojarket"
              className="oj-admin-brand-logo"
            />
            <span className="oj-admin-os-pill">SECURITY GATE</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="oj-admin-toggle-btn"
              style={{ width: "auto", padding: "0 10px", fontSize: "11px", fontWeight: 700 }}
            >
              {locale === "fr" ? "FR" : "EN"}
            </button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="oj-admin-toggle-btn"
              title={isDark ? "Mode Jour" : "Mode Nuit"}
            >
              {isDark ? "☼" : "☾"}
            </button>
            <Link
              href="/"
              className="oj-btn-secondary"
              style={{
                height: "34px",
                padding: "0 14px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
            >
              <span>←</span>
              <span>{isEn ? "Back to Marketplace" : "Retour à la vitrine"}</span>
            </Link>
          </div>
        </header>

        {/* Gate Card Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "var(--oj-color-surface)",
              border: "1px solid var(--oj-color-border)",
              borderRadius: "var(--oj-radius-card)",
              boxShadow: "var(--oj-shadow-lg)",
              padding: "36px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(173, 132, 85, 0.15)",
                color: "var(--oj-color-accent)",
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                border: "1px solid var(--oj-color-accent)",
              }}
            >
              <AdminIconLock size={26} color="var(--oj-color-accent)" />
            </div>

            <h2
              style={{
                fontFamily: "var(--oj-font-editorial)",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--oj-color-text)",
                margin: "0 0 8px 0",
              }}
            >
              {isEn ? "Platform Supervision OS" : "Supervision Administrative"}
            </h2>

            <p
              style={{
                fontSize: "13px",
                color: "var(--oj-color-muted)",
                lineHeight: 1.5,
                margin: "0 0 24px 0",
              }}
            >
              {isEn
                ? "This console is strictly restricted to verified Ojarket compliance supervisors and platform operators. Deny-by-default security policy enforced."
                : "Accès strictement restreint aux superviseurs et officiers de conformité Ojarket. Politique de sécurité Deny-by-Default active."}
            </p>

            {loginError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid var(--oj-color-errorFg)",
                  color: "var(--oj-color-errorFg)",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><AdminIconAlertTriangle size={14} color="var(--oj-color-errorFg)" /> {loginError}</span>
              </div>
            )}

            <form
              onSubmit={handleAdminLogin}
              style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--oj-color-muted)",
                    marginBottom: "6px",
                  }}
                >
                  {isEn ? "ADMINISTRATOR IDENTIFIER" : "IDENTIFIANT SUPERVISEUR"}
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@ojarket.bj"
                  required
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-bg)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--oj-color-muted)",
                    marginBottom: "6px",
                  }}
                >
                  {isEn ? "SECURITY ACCESS CODE" : "CODE D'ACCÈS DE SÉCURITÉ"}
                </label>
                <input
                  type="password"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-bg)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="oj-btn-primary"
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  marginTop: "6px",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                }}
              >
                {loginLoading
                  ? isEn
                    ? "Authenticating..."
                    : "Authentification..."
                  : isEn
                  ? "Unlock Console →"
                  : "Déverrouiller la Console →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );

  }

  return (
    <div
      className={`oj-admin-app ${isDark ? "theme-dark" : "theme-light"}`}
      data-theme={theme}
    >
      {/* ==================== COMPACT TOPBAR ==================== */}
      <header className="oj-admin-topbar">
        <div className="oj-admin-topbar-left">
          {/* Toggle Sidebar Button */}
          <button
            className="oj-admin-toggle-btn"
            onClick={() => {
              if (window.innerWidth <= 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            title={isEn ? "Toggle Sidebar" : "Réduire / Agrandir la barre latérale"}
          >
            {sidebarCollapsed ? "⇥" : "⇤"}
          </button>

          {/* Official Ojarket Logo */}
          <Link href="/" className="oj-admin-brand-wrap">
            <img
              src={
                isDark
                  ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                  : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"
              }
              alt="Ojarket"
              className="oj-admin-brand-logo"
            />
            <span className="oj-admin-os-pill">ADMIN OS</span>
          </Link>

          {/* Security Badge */}
          <span
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: "var(--oj-color-subtle)",
              color: "var(--oj-color-action)",
              fontWeight: 700,
              display: "none",
            }}
            className="oj-desktop-badge"
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><AdminIconLock size={12} color="var(--oj-color-action)" /> Deny-by-Default ACTIF</span>
          </span>
        </div>

        <div className="oj-admin-topbar-right">
          {/* Platform Role Pill with Connected User */}
          <span
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: "rgba(173, 132, 85, 0.15)",
              color: "var(--oj-color-accent)",
              fontWeight: 800,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span><AdminIconCrown size={14} color="var(--oj-color-accent)" /></span>
            <span className="oj-admin-role-text">
              {currentUser?.name || "SUPERADMIN"}
            </span>
          </span>

          {/* Language Switch */}
          <button
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="oj-admin-toggle-btn"
            style={{ width: "auto", padding: "0 10px", fontSize: "11px", fontWeight: 700 }}
          >
            {locale === "fr" ? "FR" : "EN"}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="oj-admin-toggle-btn"
            title={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
          >
            {isDark ? "☼" : "☾"}
          </button>

          {/* Storefront Link */}
          <Link
            href="/"
            className="oj-btn-secondary"
            style={{
              height: "34px",
              padding: "0 14px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            <span>←</span>
            <span>{isEn ? "Store" : "Vitrine"}</span>
          </Link>

          {/* Déconnexion Admin Button */}
          <button
            onClick={handleAdminLogout}
            className="oj-btn-secondary"
            title={isEn ? "Log out of Administration" : "Déconnexion de l'administration"}
            style={{
              height: "34px",
              padding: "0 12px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--oj-color-errorFg)",
              borderColor: "var(--oj-color-border)",
            }}
          >
            <span>⏻</span>
            <span className="oj-desktop-badge">{isEn ? "Logout" : "Déconnexion"}</span>
          </button>
        </div>
      </header>

      {/* ==================== ADMIN BODY (SIDEBAR + MAIN) ==================== */}
      <div className="oj-admin-body">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="oj-admin-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Collapsible Sidebar */}
        <aside
          className={`oj-admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
            mobileSidebarOpen ? "open" : ""
          }`}
        >
          <div>
            {/* GROUP 1: PILOTAGE */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Supervision" : "Pilotage & Supervision"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "overview" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("overview");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconBarChart size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Overview (A01)" : "Tableau de Bord"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "shops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("shops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconStore size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Shops & KYC (A03)" : "Boutiques & KYC"}
                </span>
                {pendingKycsCount > 0 && (
                  <span className="oj-admin-badge warning">{pendingKycsCount}</span>
                )}
              </button>
            </div>

            {/* GROUP 2: COMMERCE & D02 */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Bespoke & Commerce" : "Opérations D02 & Flux"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "d02" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("d02");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon">✦</span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Bespoke Requests (D02)" : "Demandes Sur-Mesure"}
                </span>
                <span className="oj-admin-badge">3</span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "corridors" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("corridors");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconLock size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Payment Corridors (A06)" : "Corridors Financiers"}
                </span>
                <span className="oj-admin-badge success">{activeCorridorsCount}</span>
              </button>
            </div>

            {/* GROUP 3: FINANCES & CONTRÔLE */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "FinOps & Ledger" : "Finance & Grand Livre"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "finops" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("finops");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconCoin size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "FinOps Cashbook (S44)" : "Caisse & FinOps"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "audit" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("audit");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconShield size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Audit Ledger (A07)" : "Grand Livre Immuable"}
                </span>
              </button>
            </div>

            {/* GROUP 4: SETTINGS */}
            <div className="oj-admin-nav-group">
              <div className="oj-admin-group-title">
                {isEn ? "Platform Settings" : "Paramètres & Plateforme"}
              </div>

              <button
                className={`oj-admin-nav-item ${activeNav === "cms" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("cms");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconPalette size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "CMS Landing Page" : "Contenu CMS"}
                </span>
              </button>

              <button
                className={`oj-admin-nav-item ${activeNav === "admins" ? "active" : ""}`}
                onClick={() => {
                  setActiveNav("admins");
                  setMobileSidebarOpen(false);
                }}
              >
                <span className="oj-admin-nav-icon"><AdminIconUsers size={16} /></span>
                <span className="oj-admin-nav-label">
                  {isEn ? "Admin Users" : "Administrateurs"}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="oj-admin-sidebar-footer">
            <div className="oj-admin-user-card">
              <div className="oj-admin-user-avatar">AD</div>
              <div className="oj-admin-user-info">
                <div className="oj-admin-user-name">Administrateur Chef</div>
                <div className="oj-admin-user-role">PLATFORM_OWNER</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="oj-admin-main">
          {/* ==================== COMPACT SECURITY BANNER ==================== */}
          <div className="oj-admin-compact-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AdminIconLock size={16} color="var(--oj-color-action)" />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {isEn
                  ? "Deny by Default Corridor Rule Active — Zero money movement permitted without verified merchant credentials & partner agreements."
                  : "Règle de Sécurité Deny-by-Default Active — Aucun mouvement financier n'est toléré sans agrément marchand vérifié."}
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                background: "rgba(255,255,255,0.2)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              PRD D-V3-007
            </span>
          </div>

          {/* ==================== TAB 1: OVERVIEW (A01) ==================== */}
          {activeNav === "overview" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Platform Overview & Health" : "Supervision Globale de la Plateforme"}</h1>
                  <p>
                    {isEn
                      ? "Consolidated transaction volume, active stores, and infrastructure telemetry."
                      : "Volume d'affaires consolidé, boutiques actives et télémétrie d'infrastructure."}
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Gross Merchandise Volume" : "Volume Global d'Affaires"}</span>
                    <span className="oj-kpi-trend positive">↗ +28.4%</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    54 800 000 FCFA
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    {isEn ? "Total committed sales (30d)" : "CA engagé sur 30 jours"}
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Active Stores" : "Boutiques & Commerces"}</span>
                    <span className="oj-kpi-trend positive">28 vérifiés</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {shops.length} Boutiques
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    Bénin (3), Mali (1), Côte d'Ivoire (1)
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-accent)" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "KYC Pending Reviews" : "Dossiers KYC à Contrôler"}</span>
                    <span className="oj-kpi-trend negative" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><AdminIconAlertTriangle size={12} /> {pendingKycsCount} requis</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "var(--oj-color-accent)" }}>
                    {pendingKycsCount} Dossiers
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    {isEn ? "Action required by compliance" : "Validation requise"}
                  </small>
                </div>

                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header">
                    <span>{isEn ? "Active Payment Corridors" : "Corridors Ouverts"}</span>
                    <span className="oj-kpi-trend positive">3 / 6</span>
                  </div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {activeCorridorsCount} Canaux
                  </strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>
                    MTN MoMo, Moov, Celtiis
                  </small>
                </div>
              </div>

              {/* Service Health Telemetry Grid */}
              <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 16px", fontFamily: "var(--oj-font-editorial)" }}>
                  {isEn ? "Platform Flow & Integration Health" : "Santé des Flux & Intégrations Plateforme"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>MTN MoMo Sandbox & Webhooks</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Latence moyenne : 240ms</small>
                    </div>
                    <span className="oj-status-pill success">OPÉRATIONNEL</span>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>Moteur D02 IA Structuration</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Pipeline V3 Gemini / Extraction</small>
                    </div>
                    <span className="oj-status-pill success">PRÊT</span>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", background: "var(--oj-color-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>PostgreSQL & Grand Livre FinOps</strong>
                      <small style={{ color: "var(--oj-color-muted)" }}>Prisma Schema V3 ACID</small>
                    </div>
                    <span className="oj-status-pill success">CONFORME</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: SHOPS & KYC (A03) ==================== */}
          {activeNav === "shops" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Stores & Merchant KYC (A03)" : "Boutiques & Modération KYC"}</h1>
                  <p>
                    {isEn
                      ? "Control verified status, examine legal trade certificates, and manage merchant onboarding."
                      : "Contrôlez les statuts marchands, examinez les registres de commerce et validez les commerçants vérifiés."}
                  </p>
                </div>
              </div>

              {/* Filter bar */}
              <div className="oj-admin-filter-bar">
                <div className="oj-admin-search">
                  <span className="oj-admin-search-icon"><AdminIconSearch size={14} /></span>
                  <input
                    type="text"
                    placeholder={isEn ? "Search store, owner, city..." : "Rechercher une boutique, propriétaire, ville..."}
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {(["ALL", "PENDING_KYC", "VERIFIED", "SUSPENDED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setShopFilter(st)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: shopFilter === st ? 700 : 500,
                        border: "1px solid var(--oj-color-border)",
                        background: shopFilter === st ? "var(--oj-color-action)" : "var(--oj-color-surface)",
                        color: shopFilter === st ? "#FFFFFF" : "var(--oj-color-text)",
                        cursor: "pointer",
                      }}
                    >
                      {st === "ALL"
                        ? isEn ? "All" : "Tous"
                        : st === "PENDING_KYC"
                        ? isEn ? "Pending" : "En attente"
                        : st === "VERIFIED"
                        ? isEn ? "Verified" : "Vérifiés"
                        : isEn ? "Suspended" : "Suspendus"}
                    </button>
                  ))}
                </div>
              </div>

              {/* High density shops table */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Store / Boutique" : "Boutique & Propriétaire"}</th>
                      <th>{isEn ? "Activity & Location" : "Activité & Ville"}</th>
                      <th>{isEn ? "Legal Credentials" : "Pièces Justificatives"}</th>
                      <th>{isEn ? "Sales" : "Ventes"}</th>
                      <th>{isEn ? "Status" : "Statut KYC"}</th>
                      <th style={{ textAlign: "right" }}>{isEn ? "Actions" : "Actions de Modération"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>{s.owner}</small>
                        </td>
                        <td>
                          <div>{s.craft}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>
                            {s.city}, {s.country}
                          </small>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><AdminIconFileText size={12} /> {s.documentType}</span>
                          </span>
                        </td>
                        <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {s.salesCount} {isEn ? "orders" : "commandes"}
                        </td>
                        <td>
                          {s.status === "VERIFIED" ? (
                            <span className="oj-status-pill success">
                              ✓ {isEn ? "Verified Pro" : "Vérifié Pro"}
                            </span>
                          ) : s.status === "PENDING_KYC" ? (
                            <span className="oj-status-pill pending">
                              {isEn ? "Pending Review" : "En attente"}
                            </span>
                          ) : (
                            <span className="oj-status-pill error">
                              ✕ {isEn ? "Suspended" : "Suspendu"}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {s.status !== "VERIFIED" && (
                              <button
                                className="oj-btn-primary"
                                style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                                onClick={() => updateShopStatus(s.id, "VERIFIED")}
                              >
                                {isEn ? "Approve Pro" : "Valider Pro"}
                              </button>
                            )}
                            {s.status !== "SUSPENDED" && (
                              <button
                                className="oj-btn-secondary"
                                style={{ height: "30px", padding: "0 10px", fontSize: "11px", borderColor: "rgba(180,44,62,0.4)", color: "#B42C3E" }}
                                onClick={() => updateShopStatus(s.id, "SUSPENDED")}
                              >
                                {isEn ? "Suspend" : "Suspendre"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: CORRIDORS (A06) ==================== */}
          {activeNav === "corridors" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Payment Corridors Governance (A06)" : "Corridors de Paiement & Deny-by-Default"}</h1>
                  <p>
                    {isEn
                      ? "Deny-by-Default security matrix: every payment channel requires an explicit contractual whitelist."
                      : "Matrice de sécurité Deny-by-Default : tout canal de règlement requiert un agrément contractuel vérifié."}
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="oj-admin-filter-bar">
                <div className="oj-admin-search">
                  <span className="oj-admin-search-icon"><AdminIconSearch size={14} /></span>
                  <input
                    type="text"
                    placeholder={isEn ? "Filter by country, channel..." : "Filtrer par pays, canal..."}
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Corridors table */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Country / Territory" : "Pays & Territoire"}</th>
                      <th>{isEn ? "Channel & Operator" : "Canal de Paiement"}</th>
                      <th>{isEn ? "Currency" : "Devise"}</th>
                      <th>{isEn ? "Limits (Min / Max)" : "Plafonds Transactionnels"}</th>
                      <th>{isEn ? "Contract Agreement" : "Contrat Partenaire"}</th>
                      <th>{isEn ? "Status" : "État du Corridor"}</th>
                      <th style={{ textAlign: "right" }}>{isEn ? "Security Switch" : "Bascule de Sécurité"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCorridors.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.country}</strong>
                          <span style={{ marginLeft: "6px", fontSize: "11px", color: "var(--oj-color-muted)" }}>
                            ({c.countryCode})
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.channel}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>KYC requis : {c.kycRequired}</small>
                        </td>
                        <td style={{ fontWeight: 700 }}>{c.currency}</td>
                        <td style={{ fontVariantNumeric: "tabular-nums", fontSize: "12px" }}>
                          {formatPrice(c.minAmountMinor / 100, c.currency)} — {formatPrice(c.maxAmountMinor / 100, c.currency)}
                        </td>
                        <td>
                          {c.contractVerified ? (
                            <span style={{ color: "var(--oj-color-action)", fontWeight: 700, fontSize: "12px" }}>
                              ✓ Signé & Conforme
                            </span>
                          ) : (
                            <span style={{ color: "#7A4A12", fontWeight: 700, fontSize: "12px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><AdminIconAlertTriangle size={12} /> Contrat Non Vérifié</span>
                            </span>
                          )}
                        </td>
                        <td>
                          {c.isEnabled ? (
                            <span className="oj-status-pill success">{isEn ? "ACTIVE" : "ACTIF"}</span>
                          ) : (
                            <span className="oj-status-pill pending">{isEn ? "DENIED / BLOCKED" : "VERROUILLÉ"}</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className={c.isEnabled ? "oj-btn-secondary" : "oj-btn-primary"}
                            style={{
                              height: "30px",
                              padding: "0 12px",
                              fontSize: "12px",
                              background: c.isEnabled ? "transparent" : undefined,
                            }}
                            onClick={() => toggleCorridor(c.id)}
                          >
                            {c.isEnabled ? (isEn ? "Deactivate" : "Désactiver") : (isEn ? "Activate" : "Activer")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: D02 BESPOKE (D02) ==================== */}
          {activeNav === "d02" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Bespoke Requests & Quotes (D02)" : "Supervision des Demandes Sur-Mesure"}</h1>
                  <p>
                    {isEn
                      ? "Track buyer demand structuring, store response rates, and awarded orders."
                      : "Suivi des demandes acheteurs, taux de réponse des boutiques et commandes issues de devis."}
                  </p>
                </div>
              </div>

              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>{isEn ? "Request Title" : "Demande Sur-Mesure"}</th>
                      <th>{isEn ? "Buyer" : "Acheteur"}</th>
                      <th>{isEn ? "Category" : "Catégorie"}</th>
                      <th>{isEn ? "Target Budget" : "Budget indicatif"}</th>
                      <th>{isEn ? "Quotes Submitted" : "Devis Reçus"}</th>
                      <th>{isEn ? "Status" : "Statut"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { title: "Parure de haute joaillerie en bronze ciselé", buyer: "Amina Diop (Cotonou)", cat: "Joaillerie & Bronze", budget: "280 000 FCFA", quotes: 2, status: "MATCHED" },
                      { title: "Table console sculptée en bois d'Iroko massif", buyer: "Marcelle Houngbo (Porto-Novo)", cat: "Mobilier d'Art", budget: "450 000 FCFA", quotes: 1, status: "MATCHED" },
                      { title: "Sac de voyage weekend en cuir pleine fleur patiné", buyer: "Didier Agossa (Parakou)", cat: "Maroquinerie", budget: "190 000 FCFA", quotes: 0, status: "OPEN" },
                    ].map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.title}</td>
                        <td style={{ color: "var(--oj-color-muted)" }}>{r.buyer}</td>
                        <td><span className="oj-status-pill success">{r.cat}</span></td>
                        <td style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{r.budget}</td>
                        <td><strong>{r.quotes} devis</strong></td>
                        <td><span className="oj-status-pill pending">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB: DISPUTES & ARBITRATION (A04) ==================== */}
          {activeNav === "disputes" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Disputes & Tripartite Arbitration (A04)" : "Médiation & Arbitrage des Litiges (A04)"}</h1>
                  <p>
                    {isEn
                      ? "Tripartite mediation between buyer, merchant store, and platform conciliation supervisor."
                      : "Résolution tripartite des réclamations : examen des preuves, offres de conciliation et arbitrage officiel."}
                  </p>
                </div>
              </div>

              {/* Filter bar */}
              <div className="oj-admin-filter-bar">
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["ALL", "UNDER_REVIEW", "PROPOSAL_MADE", "RESOLVED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDisputeFilter(st)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: disputeFilter === st ? 700 : 500,
                        border: "1px solid var(--oj-color-border)",
                        background: disputeFilter === st ? "var(--oj-color-action)" : "var(--oj-color-surface)",
                        color: disputeFilter === st ? "#FFFFFF" : "var(--oj-color-text)",
                        cursor: "pointer",
                      }}
                    >
                      {st === "ALL"
                        ? isEn ? "All Disputes" : "Tous les Litiges"
                        : st === "UNDER_REVIEW"
                        ? isEn ? "In Review" : "En Examen"
                        : st === "PROPOSAL_MADE"
                        ? isEn ? "Proposal Offered" : "Proposition Marchande"
                        : isEn ? "Resolved" : "Résolus"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disputes List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {disputes
                  .filter((d) => disputeFilter === "ALL" || d.status === disputeFilter)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="oj-admin-table-card"
                      style={{
                        padding: "24px",
                        borderLeft: d.status === "RESOLVED" ? "4px solid #10B981" : "4px solid #AD8455",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#AD8455", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            COMMANDE {d.orderNumber || d.orderId} · {d.category}
                          </div>
                          <h3 style={{ margin: "4px 0", fontSize: "18px", color: "var(--oj-color-text)" }}>
                            {d.title}
                          </h3>
                          <div style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>
                            Signalé par <strong>{d.reporterName}</strong> {d.reporterPhone ? `(${d.reporterPhone})` : ""} · {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>

                        <span className={`oj-status-pill ${d.status === "RESOLVED" ? "success" : d.status === "PROPOSAL_MADE" ? "pending" : "error"}`}>
                          {d.status === "RESOLVED"
                            ? "✓ ARBITRÉ & CLOS"
                            : d.status === "PROPOSAL_MADE"
                            ? "PROPOSITION FAITE"
                            : "EN INSTRUCTION"}
                        </span>
                      </div>

                      <p style={{ fontSize: "14px", color: "var(--oj-color-text)", lineHeight: 1.5, margin: "10px 0 16px" }}>
                        {d.description}
                      </p>

                      {/* Evidence URLs */}
                      {d.evidenceUrls && d.evidenceUrls.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--oj-color-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                            Pièces Justificatives Téléversées :
                          </div>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {d.evidenceUrls.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  backgroundColor: "var(--oj-color-subtle)",
                                  border: "1px solid var(--oj-color-border)",
                                  fontSize: "12px",
                                  color: "var(--oj-color-action)",
                                  textDecoration: "none",
                                }}
                              >
                                <span><AdminIconFileText size={12} /></span>
                                <span>Preuve #{idx + 1} (Ouvrir ↗)</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Merchant Proposal */}
                      {d.proposedOutcome && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(173, 132, 85, 0.1)",
                            border: "1px solid rgba(173, 132, 85, 0.3)",
                            marginBottom: "16px",
                          }}
                        >
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#AD8455", textTransform: "uppercase" }}>
                            Proposition de Règlement formulée par la Boutique :
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--oj-color-text)", marginTop: "4px" }}>
                            {d.proposedOutcome}
                          </div>
                        </div>
                      )}

                      {/* Final Resolution if already resolved */}
                      {d.resolution && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            marginBottom: "16px",
                          }}
                        >
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#075D49", textTransform: "uppercase" }}>
                            Décision d'Arbitrage Officielle :
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--oj-color-text)", marginTop: "4px" }}>
                            {d.resolution}
                          </div>
                        </div>
                      )}

                      {/* Moderator Action Buttons */}
                      {d.status !== "RESOLVED" && (
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--oj-color-border)" }}>
                          <button
                            className="oj-btn-primary"
                            style={{ height: "34px", padding: "0 14px", fontSize: "12px" }}
                            onClick={() =>
                              handleArbitrateDispute(
                                d.id,
                                "Arbitrage en faveur de l'acheteur : Remboursement intégral ou remplacement validé par la modération.",
                                "Remboursement / Remplacement Conforme"
                              )
                            }
                          >
                            Arbitrer en faveur de l'Acheteur
                          </button>
                          <button
                            className="oj-btn-secondary"
                            style={{ height: "34px", padding: "0 14px", fontSize: "12px", color: "#AD8455", borderColor: "#AD8455" }}
                            onClick={() =>
                              handleArbitrateDispute(
                                d.id,
                                `Accord amiable validé d'après la proposition de la boutique : ${d.proposedOutcome || "Geste commercial validé"}.`,
                                d.proposedOutcome || "Accord Amiable Validé"
                              )
                            }
                          >
                            Valider la Proposition Boutique
                          </button>
                          <button
                            className="oj-btn-secondary"
                            style={{ height: "34px", padding: "0 14px", fontSize: "12px", color: "#B42C3E", borderColor: "rgba(180,44,62,0.4)" }}
                            onClick={() =>
                              handleArbitrateDispute(
                                d.id,
                                "Réclamation non fondée après analyse des pièces. Commande confirmée conforme.",
                                "Clôture sans suite"
                              )
                            }
                          >
                            Rejeter le Litige
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: FINOPS (S44/S46) ==================== */}
          {activeNav === "finops" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Merchant FinOps & Cashbook Ledger (S44)" : "Livre de Caisse & Rapprochement FinOps"}</h1>
                  <p>
                    {isEn
                      ? "Triad monitoring: Total Gross Sold != Amount Collected != Remaining Receivable. Append-only events."
                      : "Surveillance de la triade : Vendu ≠ Encaissé ≠ Restant. Grand livre immuable non-custodial."}
                  </p>
                </div>
              </div>

              {/* Triade summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid var(--oj-color-action)" }}>
                  <div className="oj-kpi-header"><span>Chiffre d'Affaires Engagé (Vendu)</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums" }}>1 280 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Total des commandes fermes</small>
                </div>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #185F46" }}>
                  <div className="oj-kpi-header"><span>Liquidités Encaissées (Direct MoMo/Comptoir)</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#185F46" }}>850 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Relevés de caisse confirmés</small>
                </div>
                <div className="oj-kpi-card" style={{ borderLeft: "4px solid #AD8455" }}>
                  <div className="oj-kpi-header"><span>Créances Clients en Attente</span></div>
                  <strong className="oj-kpi-value" style={{ fontVariantNumeric: "tabular-nums", color: "#AD8455" }}>430 000 FCFA</strong>
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>Soldes à percevoir à livraison</small>
                </div>
              </div>

              {/* Recent FinOps flows */}
              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>Libellé & Référence</th>
                      <th>Canal de Paiement</th>
                      <th>Heure</th>
                      <th>Statut Audit</th>
                      <th style={{ textAlign: "right" }}>Montant Encaissé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Commande OJK-2026-0891 (Sac Cabas Grand Marché)", ref: "TXN-MTN-89021", channel: "MTN Mobile Money", time: "14:32", status: "Confirmé par PSP", amount: 185000 },
                      { label: "Vente directe comptoir — Porte-carte cuir cognac", ref: "REC-CPT-004", channel: "Espèces", time: "11:15", status: "Confirmé par vendeur", amount: 45000 },
                      { label: "Commande Galerie Royale — Solde à livraison", ref: "CMD-GAL-990", channel: "Virement", time: "09:10", status: "Créance en attente", amount: 120000 },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.label}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>{row.ref}</small>
                        </td>
                        <td>{row.channel}</td>
                        <td style={{ color: "var(--oj-color-muted)" }}>{row.time}</td>
                        <td><span className="oj-status-pill success">{row.status}</span></td>
                        <td style={{ textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {formatPrice(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: AUDIT LOG (A07) ==================== */}
          {activeNav === "audit" && (
            <div>
              <div className="oj-admin-header-row" style={{ flexWrap: "wrap", gap: "16px" }}>
                <div className="oj-admin-title-wrap">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1>{isEn ? "Cryptographic Immutable Audit Ledger (A07)" : "Grand Livre d'Audit Immuable Scellé (SHA-256)"}</h1>
                    <span className="oj-status-pill success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <AdminIconShield size={12} color="var(--oj-color-action)" />
                      {isEn ? "TAMPER-PROOF LEDGER" : "REGISTRE INALTÉRABLE"}
                    </span>
                  </div>
                  <p>
                    {isEn
                      ? "Cryptographically chained event log with SHA-256 Merkle-link and automated periodic closing seals."
                      : "Historique inaltérable chaîné par empreintes SHA-256 successives avec clôtures périodiques scellées par HMAC."}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="oj-btn-secondary"
                    onClick={handleVerifyChainIntegrity}
                    disabled={verifyingChain}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                  >
                    <AdminIconShield size={14} color="var(--oj-color-action)" />
                    {verifyingChain ? (isEn ? "Verifying..." : "Vérification...") : (isEn ? "Verify Hash Chain" : "Vérifier la Chaîne de Blocs")}
                  </button>
                  <button
                    className="oj-btn-primary"
                    onClick={handleGenerateAuditReport}
                    disabled={generatingReport}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
                  >
                    <AdminIconLock size={14} color="#FFFFFF" />
                    {generatingReport ? (isEn ? "Sealing Report..." : "Scellement en cours...") : (isEn ? "Generate Sealed Report" : "Générer Clôture Scellée")}
                  </button>
                </div>
              </div>

              {/* Chain Integrity Alert Banner */}
              {chainIntegrity && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    background: chainIntegrity.isValid ? "rgba(7, 93, 73, 0.08)" : "rgba(220, 38, 38, 0.08)",
                    border: `1px solid ${chainIntegrity.isValid ? "var(--oj-color-action)" : "#DC2626"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: chainIntegrity.isValid ? "var(--oj-color-action)" : "#DC2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AdminIconShield size={16} />
                      {chainIntegrity.isValid 
                        ? (isEn ? "Cryptographic Chain Verified: 100% Intact" : "Intégrité Cryptographique Certifiée : 100% Conforme") 
                        : (isEn ? "Warning: Blockchain Alteration Detected" : "Alerte : Altération Détectée dans la Chaîne")}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--oj-color-muted)", marginTop: "4px" }}>
                      {isEn
                        ? `Verified ${chainIntegrity.totalBlocks} event blocks from Genesis. Last verified at ${new Date(chainIntegrity.verifiedAt).toLocaleTimeString()}.`
                        : `${chainIntegrity.totalBlocks} blocs d'événements certifiés depuis le Bloc Genèse. Vérifié à ${new Date(chainIntegrity.verifiedAt).toLocaleTimeString()}.`}
                    </div>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", background: "var(--oj-color-surface)", padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--oj-color-border)" }}>
                    <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Latest Hash:" : "Dernier Hash :"}</span>{" "}
                    <strong style={{ color: "var(--oj-color-accent)" }}>{chainIntegrity.latestHash.slice(0, 16)}...</strong>
                  </div>
                </div>
              )}

              {/* Sealed Periodic Reports Summary (Dossier 6) */}
              {auditReports.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AdminIconLock size={15} color="var(--oj-color-accent)" />
                    {isEn ? "Sealed Audit & Closing Reports" : "Rapports d'Audit & Clôtures Périodiques Scellées"}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {auditReports.map((rep) => (
                      <div
                        key={rep.id}
                        style={{
                          background: "var(--oj-color-surface)",
                          border: "1px solid var(--oj-color-border)",
                          borderRadius: "12px",
                          padding: "16px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{rep.reportPeriod}</div>
                            <div style={{ fontSize: "11px", color: "var(--oj-color-muted)" }}>
                              {new Date(rep.generatedAt).toLocaleString(locale === "en" ? "en-US" : "fr-FR")}
                            </div>
                          </div>
                          <span className="oj-status-pill success" style={{ fontSize: "10px", padding: "2px 8px" }}>
                            {isEn ? "HMAC SEALED" : "SCELLÉ HMAC"}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", marginBottom: "12px", background: "var(--oj-color-bg)", padding: "10px", borderRadius: "8px" }}>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Audit Blocks:" : "Événements :"}</span>{" "}
                            <strong>{rep.totalEventsCount}</strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Volume:" : "Volume :"}</span>{" "}
                            <strong>{(rep.totalOrdersVolumeMinor / 100).toLocaleString()} XOF</strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Verified Shops:" : "Boutiques :"}</span>{" "}
                            <strong>{rep.activeShopsCount}</strong>
                          </div>
                          <div>
                            <span style={{ color: "var(--oj-color-muted)" }}>{isEn ? "Resolved Disputes:" : "Litiges Réglés :"}</span>{" "}
                            <strong>{rep.resolvedDisputesCount}</strong>
                          </div>
                        </div>

                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--oj-color-muted)", wordBreak: "break-all" }}>
                          <span style={{ color: "var(--oj-color-accent)", fontWeight: 700 }}>SEAL:</span> {rep.signatureSeal.slice(0, 32)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chained Events Table */}
              <div className="oj-admin-table-card">
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--oj-color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700 }}>
                    {isEn ? "Cryptographic Event Trail (SHA-256 Chained)" : "Registre des Événements Chaînés (SHA-256)"}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                    {auditLogs.length} {isEn ? "records" : "enregistrements"}
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="oj-admin-table">
                    <thead>
                      <tr>
                        <th>{isEn ? "Security Action" : "Action de Sécurité"}</th>
                        <th>{isEn ? "Target / Resource" : "Cible / Ressource"}</th>
                        <th>{isEn ? "Operator & Role" : "Opérateur & Rôle"}</th>
                        <th>{isEn ? "Timestamp" : "Horodatage"}</th>
                        <th>{isEn ? "IP / Source" : "IP Source"}</th>
                        <th>{isEn ? "SHA-256 Hash Chaining" : "Empreinte Cryptographique"}</th>
                        <th>{isEn ? "Status" : "Statut"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "var(--oj-color-action)" }}>
                              [{log.action}]
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, fontSize: "13px" }}>{log.target}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{log.operator}</div>
                            <small style={{ color: "var(--oj-color-accent)", fontWeight: 700 }}>{log.role}</small>
                          </td>
                          <td style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{log.time}</td>
                          <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--oj-color-muted)" }}>{log.ip}</td>
                          <td>
                            <div style={{ fontFamily: "monospace", fontSize: "11px" }}>
                              {log.hash ? (
                                <div>
                                  <div style={{ color: "var(--oj-color-action)", fontWeight: 700 }}>
                                    #{log.hash.slice(0, 10)}...
                                  </div>
                                  <div style={{ color: "var(--oj-color-muted)", fontSize: "9px" }}>
                                    prev: {log.previousHash?.slice(0, 8)}...
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: "var(--oj-color-muted)" }}>#GENESIS-SEAL</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`oj-status-pill ${log.status === "SUCCESS" ? "success" : log.status === "BLOCKED" ? "error" : "pending"}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 7: CMS Landing Page ==================== */}
          {activeNav === "cms" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "CMS Landing Page Builder" : "Gestion de la page d'accueil"}</h1>
                  <p>
                    {isEn
                      ? "Configure banners, featured products, intemporel icons, and trusted shops."
                      : "Configurez les bannières, produits mis en avant, icônes intemporelles et boutiques de confiance."}
                  </p>
                </div>
                <button
                  className="oj-btn-primary"
                  disabled={cmsSaving || cmsLoading}
                  onClick={handleSaveCms}
                  style={{ height: "40px", padding: "0 20px" }}
                >
                  {cmsSaving ? (isEn ? "Saving..." : "Sauvegarde...") : (isEn ? "Save Changes" : "Sauvegarder")}
                </button>
              </div>

              {cmsLoading ? (
                <p>Loading CMS config...</p>
              ) : cmsConfig ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="oj-admin-table-card" style={{ padding: "20px" }}>
                    <h3>{isEn ? "Raw Config Data (JSON)" : "Données de Configuration (JSON)"}</h3>
                    <textarea
                      style={{
                        width: "100%",
                        height: "400px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        padding: "10px",
                        border: "1px solid var(--oj-color-border)",
                        backgroundColor: "var(--oj-color-bg)",
                        color: "var(--oj-color-text)",
                        borderRadius: "8px"
                      }}
                      value={JSON.stringify(cmsConfig, null, 2)}
                      onChange={(e) => {
                        try {
                          setCmsConfig(JSON.parse(e.target.value));
                        } catch(err) {
                          // ignore parse errors while typing
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p>Failed to load CMS Config.</p>
              )}
            </div>
          )}

          {/* ==================== TAB 8: ADMIN USERS ==================== */}
          {activeNav === "admins" && (
            <div>
              <div className="oj-admin-header-row">
                <div className="oj-admin-title-wrap">
                  <h1>{isEn ? "Admin Users Management" : "Gestion des Administrateurs"}</h1>
                  <p>
                    {isEn
                      ? "Manage platform administrators and compliance officers."
                      : "Gérez les administrateurs et officiers de conformité de la plateforme."}
                  </p>
                </div>
              </div>

              <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
                <h3>{isEn ? "Promote User to Admin" : "Promouvoir un Utilisateur"}</h3>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)" }}
                  />
                  <input
                    type="text"
                    placeholder={isEn ? "Name (optional)" : "Nom (optionnel)"}
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)" }}
                  />
                  <button
                    className="oj-btn-primary"
                    disabled={adminSaving || !newAdminEmail}
                    onClick={handlePromoteAdmin}
                    style={{ padding: "0 20px" }}
                  >
                    {adminSaving ? "..." : (isEn ? "Promote" : "Promouvoir")}
                  </button>
                </div>
              </div>

              <div className="oj-admin-table-card">
                <table className="oj-admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>{isEn ? "Name" : "Nom"}</th>
                      <th>Role</th>
                      <th>ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminLoading ? (
                      <tr><td colSpan={4}>Loading...</td></tr>
                    ) : adminUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.email}</td>
                        <td>{u.name}</td>
                        <td><span className="oj-status-pill success">{u.role}</span></td>
                        <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--oj-color-muted)" }}>{u.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
