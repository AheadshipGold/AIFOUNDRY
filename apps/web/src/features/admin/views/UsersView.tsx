"use client";

import React, { useState, useEffect } from "react";
import { getStoredToken } from "../../../lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminIconCheck, AdminIconPlus } from "../components/shared/AdminIcons";

const apiBase = '/api/v1';

export function UsersView() {
  const { isEn, locale, currentUser } = useAdmin();

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("OPERATIONS_ADMIN");
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState("");

  const fetchAdmins = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/users`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdminUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handlePromoteAdmin = async () => {
    if (!newAdminEmail) return;
    setAdminSaving(true);
    setAdminSuccessMsg("");
    try {
      const res = await fetch(`${apiBase}/admin/users/create`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ email: newAdminEmail, name: newAdminName, role: newAdminRole })
      });
      if (res.ok) {
        setAdminSuccessMsg(isEn ? "Administrator promoted successfully!" : "Administrateur habilitÃ© avec succÃ¨s !");
        setTimeout(() => setAdminSuccessMsg(""), 4500);
        fetchAdmins();
        setNewAdminEmail("");
        setNewAdminName("");
      } else {
        alert(isEn ? "Error creating admin" : "Erreur lors de la promotion de l'administrateur");
      }
    } catch (e) {
      console.error(e);
      alert(isEn ? "Error creating admin" : "Erreur de connexion");
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "Platform Administrators & Governance" : "Gestion des Administrateurs & Supervision"}</h1>
          <p>
            {isEn
              ? "Manage platform administrators, compliance officers, and master cryptographic access keys."
              : "GÃ©rez les comptes habilitÃ©s, rÃ´les de gouvernance et officiers de conformitÃ© de la plateforme."}
          </p>
        </div>
      </div>

      {/* Platform Owner Honour Card */}
      <div className="oj-admin-owner-card">
        <div className="oj-admin-owner-info">
          <div className="oj-admin-owner-avatar">AB</div>
          <div className="oj-admin-owner-details">
            <h3>
              <span>{currentUser?.name || "ABRAHAM B. A."}</span>
              <span className="oj-status-pill success" style={{ background: "#D4B483", color: "#0A1210", fontWeight: 800, fontSize: "11px" }}>
                PLATFORM OWNER
              </span>
            </h3>
            <p>{currentUser?.email || "damacarre@gmail.com"} Â· Gouvernance SuprÃªme & Supervision GÃ©nÃ©rale</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--oj-color-action)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <AdminIconCheck size={14} color="var(--oj-color-action)" /> Session Active Â· MFA SÃ©curisÃ©
          </span>
        </div>
      </div>

      {/* Promotion Form */}
      <div className="oj-admin-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>
          {isEn ? "Habilitate New Administrator" : "Habiliter un Nouvel Administrateur"}
        </h3>

        {adminSuccessMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", color: "#10B981", fontWeight: 600, fontSize: "13px", marginBottom: "14px" }}>
            âœ“ {adminSuccessMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", gap: "10px", alignItems: "center" }}>
          <input
            type="email"
            placeholder="Email (ex: officier@ojarket.bj)"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)", fontSize: "13px" }}
          />
          <input
            type="text"
            placeholder={isEn ? "Name (optional)" : "Nom de l'officier"}
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)", fontSize: "13px" }}
          />
          <select
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--oj-color-border)", background: "var(--oj-color-bg)", color: "var(--oj-color-text)", fontSize: "13px", fontWeight: 600 }}
          >
            <option value="OPERATIONS_ADMIN">OPERATIONS_ADMIN</option>
            <option value="COMPLIANCE_ADMIN">COMPLIANCE_ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          <button
            className="oj-btn-primary"
            disabled={adminSaving || !newAdminEmail}
            onClick={handlePromoteAdmin}
            style={{ height: "40px", padding: "0 20px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
          >
            <AdminIconPlus size={14} />
            {adminSaving ? "..." : (isEn ? "Grant Access" : "Habiliter")}
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="oj-admin-table-card">
        <table className="oj-admin-table">
          <thead>
            <tr>
              <th>{isEn ? "Administrator" : "Administrateur"}</th>
              <th>{isEn ? "Governance Role" : "RÃ´le de Gouvernance"}</th>
              <th>{isEn ? "MFA Security" : "SÃ©curitÃ© & MFA"}</th>
              <th>{isEn ? "Appointment Date" : "Date de Nomination"}</th>
              <th style={{ textAlign: "right" }}>{isEn ? "Status" : "Statut"}</th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--oj-color-muted)" }}>Chargement des administrateurs...</td></tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--oj-color-muted)" }}>
                  Aucun administrateur trouvÃ©.
                </td>
              </tr>
            ) : (
              adminUsers.map((u: any) => {
                const isOwner = u.role === "PLATFORM_OWNER" || u.email?.toLowerCase().includes("damacarre");
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: isOwner ? "#AD8455" : "var(--oj-color-action)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          {u.name
                            ? u.name
                                .split(" ")
                                .map((w: string) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "AD"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--oj-color-text)" }}>
                            {u.name || "Administrateur"}
                          </div>
                          <small style={{ color: "var(--oj-color-muted)", fontSize: "11px" }}>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`oj-status-pill ${isOwner ? "success" : "pending"}`}
                        style={isOwner ? { background: "rgba(173,132,85,0.2)", color: "#AD8455", fontWeight: 800, border: "1px solid rgba(173,132,85,0.4)" } : undefined}
                      >
                        {isOwner ? "PLATFORM_OWNER" : u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--oj-color-action)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <AdminIconCheck size={12} color="var(--oj-color-action)" /> MFA Actif
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR") : "Actif"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="oj-status-pill success">
                        ACTIF
                      </span>
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

