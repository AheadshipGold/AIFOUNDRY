"use client";

import React, { useEffect, useState } from "react";
import { useAdmin } from "../context/AdminContext";
import { AdminIconUsers, AdminIconSearch, AdminIconTrash, AdminIconStore } from "../components/shared/AdminIcons";
import { AuthApi } from "../../../lib/api";

export function CrmView() {
  const { isEn, locale } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AuthApi.executeFetch('/v1/admin/crm?q=' + encodeURIComponent(search));
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(isEn ? "Are you sure you want to delete user " + email + "?" : "Voulez-vous vraiment supprimer l'utilisateur " + email + " ?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const res = await AuthApi.executeFetch('/v1/admin/crm/' + id, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="oj-admin-view-fade">
      <div className="oj-admin-view-header">
        <div>
          <h2>{isEn ? "Clients & CRM" : "Clients & Utilisateurs"}</h2>
          <p>
            {isEn
              ? "Manage all registered users, buyers, and sellers on the platform."
              : "Gérez tous les utilisateurs inscrits, clients et vendeurs de la plateforme."}
          </p>
        </div>
      </div>

      <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <AdminIconSearch size={18} color="var(--oj-color-muted)" />
          <input
            type="text"
            placeholder={isEn ? "Search by email or name..." : "Rechercher par email ou nom..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)", fontSize: "14px" }}
          />
        </div>
      </div>

      <div className="oj-admin-table-card">
        <table className="oj-admin-table">
          <thead>
            <tr>
              <th>{isEn ? "User" : "Utilisateur"}</th>
              <th>{isEn ? "Profile Type" : "Type de Profil"}</th>
              <th>{isEn ? "Registration Date" : "Date d'inscription"}</th>
              <th>{isEn ? "Orders" : "Commandes"}</th>
              <th style={{ textAlign: "right" }}>{isEn ? "Actions" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--oj-color-muted)" }}>Chargement...</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--oj-color-muted)" }}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              users.map((u: any) => {
                const isAdmin = u.role === 'ADMIN' || u.role === 'PLATFORM_OWNER';
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--oj-color-border)",
                            backgroundImage: u.avatarUrl ? 'url(' + u.avatarUrl + ')' : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--oj-color-muted)",
                            fontWeight: 700,
                            fontSize: "14px",
                          }}
                        >
                          {!u.avatarUrl && (u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase())}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--oj-color-text)" }}>
                            {u.name || "Client Ojarket"}
                          </div>
                          <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.isSeller ? (
                        <span className="oj-status-pill success" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <AdminIconStore size={12} />
                          {isEn ? "SELLER" : "VENDEUR"}
                        </span>
                      ) : isAdmin ? (
                        <span className="oj-status-pill pending" style={{ background: "rgba(173,132,85,0.2)", color: "#AD8455" }}>
                          {isEn ? "ADMIN" : "ADMINISTRATEUR"}
                        </span>
                      ) : (
                        <span className="oj-status-pill neutral">
                          {isEn ? "BUYER" : "CLIENT"}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--oj-color-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR")}
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--oj-color-text)", fontWeight: 600 }}>
                      {u.ordersCount}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!isAdmin && (
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          disabled={deleteLoading === u.id}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#EF4444",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            opacity: deleteLoading === u.id ? 0.5 : 1
                          }}
                          title="Supprimer l'utilisateur"
                        >
                          <AdminIconTrash size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
