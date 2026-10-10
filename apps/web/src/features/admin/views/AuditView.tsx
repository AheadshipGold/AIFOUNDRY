"use client";

import React, { useState } from "react";
import { getStoredToken } from "../../../lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminIconShield, AdminIconLock } from "../components/shared/AdminIcons";
import { AuditEntry } from "../types";

const apiBase = '/api/v1';

export function AuditView() {
  const { isEn, locale } = useAdmin();

  const [chainIntegrity, setChainIntegrity] = useState<any>(null);
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [auditReports, setAuditReports] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);

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
      action: "SHOP_KYC_APPROVED",
      target: "Maison Laurent & Ganvié",
      operator: "officier_conformite",
      role: "COMPLIANCE_ADMIN",
      time: "Aujourd'hui 14:15",
      ip: "41.202.207.2",
      status: "SUCCESS",
      hash: "e3b0c44298fc1c149afbf4c8996fb924",
      previousHash: "8b1a9953c4611296a827abf8c47804d7",
    },
    {
      id: "aud-03",
      action: "ARBITRAGE_LITIGE",
      target: "Commande OJK-9281",
      operator: "mediateur_principal",
      role: "OPERATIONS_ADMIN",
      time: "Hier 16:40",
      ip: "10.0.0.8",
      status: "SUCCESS",
      hash: "8b1a9953c4611296a827abf8c47804d7",
      previousHash: "00000000000000000000000000000000",
    }
  ]);

  const handleVerifyChainIntegrity = async () => {
    setVerifyingChain(true);
    try {
      const res = await fetch(`${apiBase}/admin/audit/verify-chain`, {
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
      const res = await fetch(`${apiBase}/admin/audit/reports/generate`, {
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

  return (
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
  );
}
