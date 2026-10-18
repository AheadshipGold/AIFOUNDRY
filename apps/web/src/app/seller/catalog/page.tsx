"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredToken, getStoredUser } from "@/lib/api";
import { sellerTranslations, SellerLocale, getInitialSellerLocale } from "@/lib/seller-i18n";

interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priceMinor: number;
  stockOnHand: number;
  image: string;
  isPublished?: boolean;
  variants: Array<{
    id: string;
    sku: string;
    priceMinor: number;
    stockOnHand: number;
  }>;
}

export default function SellerCatalogPage() {
  const [locale, setLocale] = useState<SellerLocale>("fr");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "drafts" | "low_stock">("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    try {
      const initial = getInitialSellerLocale();
      setLocale(initial);
    } catch {}

    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const token = getStoredToken();
    const storedUser = getStoredUser();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(storedUser?.id ? { "x-user-id": storedUser.id } : {}),
    };

    fetch("/api/v1/seller/products", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTogglePublish = async (prod: ProductItem) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const newStatus = !prod.isPublished;
      const res = await fetch(`/api/v1/products/${prod.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPublished: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isPublished: newStatus } : p))
      );
      showToast(newStatus ? "Création publiée en vitrine avec succès" : "Création retirée de la vitrine");
    } catch (err: any) {
      showToast(err.message || "Erreur de mise à jour", "error");
    }
  };

  const handleDelete = async (prodId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette création ?")) {
      return;
    }

    const token = getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`/api/v1/products/${prodId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error("Impossible de supprimer le produit");
      }

      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      showToast("Produit supprimé du catalogue avec succès");
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la suppression", "error");
    }
  };

  const t = sellerTranslations[locale];

  const formatPrice = (minor: number) => {
    return (minor / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " FCFA";
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "published") return p.isPublished === true;
    if (filter === "drafts") return p.isPublished === false;
    if (filter === "low_stock") return p.stockOnHand <= 2;
    return true;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100,
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: toast.type === "success" ? "#075D49" : "#B71C1C",
            color: "#F8F6F0",
            fontSize: "13.5px",
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="seller-page-header">
        <div>
          <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 8px 0" }}>
            {t.catalog.title}
          </h1>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
            {t.catalog.subtitle}
          </p>
        </div>

        <div className="seller-header-btn-group">
          <Link
            href="/seller/catalog/new"
            className="seller-action-btn"
            style={{ padding: "10px 20px", fontSize: "13px" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{t.catalog.addNewButton}</span>
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div
        className="seller-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          padding: "14px 20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px 10px 38px",
              borderRadius: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#F8F6F0",
              fontSize: "13.5px",
              outline: "none",
            }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(248, 246, 240, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: "12px", top: "12px" }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Filter Pills */}
        <div className="seller-filter-bar">
          {[
            { id: "all", label: t.catalog.filterAll },
            { id: "published", label: t.catalog.filterPublished },
            { id: "drafts", label: t.catalog.filterDrafts },
            { id: "low_stock", label: t.catalog.filterLowStock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`seller-filter-pill ${filter === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table or Empty State */}
      {loading ? (
        <div style={{ padding: "64px", textAlign: "center", color: "rgba(248, 246, 240, 0.5)" }}>
          Chargement du catalogue certifié...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          className="seller-card"
          style={{
            padding: "64px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              backgroundColor: "rgba(173, 132, 85, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4B483",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h3 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "20px", color: "#F8F6F0", margin: "0 0 8px 0" }}>
            {t.catalog.emptyTitle}
          </h3>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px" }}>
            {t.catalog.emptyDesc}
          </p>
          <Link
            href="/seller/catalog/new"
            className="seller-action-btn"
            style={{ padding: "10px 24px", fontSize: "13px" }}
          >
            <span>{t.catalog.addNewButton}</span>
          </Link>
        </div>
      ) : (
        <div
          className="seller-card"
          style={{
            overflow: "hidden",
            padding: 0,
          }}
        >
          <div className="seller-table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(248, 246, 240, 0.6)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tableImage}</th>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tableTitle}</th>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tableCategory}</th>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tablePrice}</th>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tableStock}</th>
                <th style={{ padding: "16px 20px" }}>{t.catalog.tableStatus}</th>
                <th style={{ padding: "16px 20px", textAlign: "right" }}>{t.catalog.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const sku = prod.variants?.[0]?.sku || "N/A";
                const isPub = prod.isPublished !== false;

                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "background-color 0.1s ease",
                    }}
                  >
                    {/* Visual Thumbnail */}
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "6px",
                          backgroundColor: "var(--oj-color-canvas, #081018)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.4)" }}>Photo</span>
                        )}
                      </div>
                    </td>

                    {/* Title & SKU */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 600, color: "#F8F6F0", marginBottom: "4px" }}>
                        {prod.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(248, 246, 240, 0.5)", fontFamily: "monospace" }}>
                        {sku}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "16px 20px", color: "rgba(248, 246, 240, 0.8)", textTransform: "capitalize" }}>
                      {prod.category}
                    </td>

                    {/* Unit Price */}
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "#D4B483", fontVariantNumeric: "tabular-nums" }}>
                      {formatPrice(prod.priceMinor)}
                    </td>

                    {/* Stock on Hand */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: prod.stockOnHand <= 2 ? "rgba(229, 115, 115, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: prod.stockOnHand <= 2 ? "#E57373" : "#10B981",
                        }}
                      >
                        {prod.stockOnHand} en stock
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: isPub ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.1)",
                          color: isPub ? "#10B981" : "rgba(248, 246, 240, 0.6)",
                          border: isPub ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        {isPub ? t.catalog.published : t.catalog.draft}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => handleTogglePublish(prod)}
                          title={isPub ? t.catalog.unpublish : t.catalog.publish}
                          className={isPub ? "seller-btn-unpublish" : "seller-btn-publish"}
                        >
                          {isPub ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                              </svg>
                              <span>Retirer</span>
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>Publier</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          title={t.catalog.delete}
                          className="seller-btn-delete"
                          aria-label="Ôter le produit du catalogue"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
