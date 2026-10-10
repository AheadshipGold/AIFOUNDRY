"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthApi } from "../../../lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminIconLock, AdminIconAlertTriangle } from "../components/shared/AdminIcons";

export function SecurityGateView() {
  const { isEn, locale, setLocale, theme, setTheme, setCurrentUser } = useAdmin();
  const isDark = theme === "dark";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

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
        <Link href="/" className="oj-admin-brand-wrap" style={{ textDecoration: "none" }}>
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
            {isDark ? "☀️" : "🌙"}
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
            borderRadius: "var(--oj-radius-card, 16px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
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
              fontFamily: "var(--oj-font-editorial, serif)",
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
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <AdminIconAlertTriangle size={14} color="var(--oj-color-errorFg)" /> {loginError}
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
                placeholder="••••••••••••"
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
                height: "44px",
                marginTop: "10px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {loginLoading
                ? (isEn ? "AUTHENTICATING..." : "VÉRIFICATION...")
                : (isEn ? "AUTHORIZE ACCESS" : "AUTORISER L'ACCÈS")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
