"use client";

import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { AdminIconSearch, AdminIconFileText } from "../components/shared/AdminIcons";
import { ShopReview } from "../types";

export function ShopsView() {
  const { isEn } = useAdmin();

  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    import("../../../lib/api").then(({ AuthApi }) => {
      AuthApi.executeFetch("/api/v1/admin/shops")
        .then((res) => {
          setShops(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    });
  }, []);

  const [shopSearch, setShopSearch] = useState("");
  const [shopFilter, setShopFilter] = useState<string>("ALL");

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      !shopSearch ||
      s.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      (s.ownerName || "").toLowerCase().includes(shopSearch.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(shopSearch.toLowerCase());
    const matchesStatus = shopFilter === "ALL" || s.status === shopFilter;
    return matchesSearch && matchesStatus;
  });

  const updateShopStatus = async (id: string, status: "VERIFIED" | "PENDING_KYC" | "SUSPENDED" | "VERIFIED_PRO") => {
    try {
      const { AuthApi } = await import("../../../lib/api");
      await AuthApi.executeFetch(`/api/v1/admin/shops/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setShops((prev) => prev.map((s) => (s.id === id ? { ...s, status: status === 'VERIFIED_PRO' ? 'VERIFIED' : status } : s)));
    } catch (err) {
      console.error("Failed to update shop status", err);
      alert("Failed to update shop status");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
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
                  <small style={{ color: "var(--oj-color-muted)" }}>{s.ownerName}</small>
                </td>
                <td>
                  <div>{s.craftType}</div>
                  <small style={{ color: "var(--oj-color-muted)" }}>
                    {s.city}, {s.country}
                  </small>
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  {s.ordersCount} {isEn ? "orders" : "commandes"}
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
                        onClick={() => updateShopStatus(s.id, "VERIFIED_PRO")}
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
  );
}
