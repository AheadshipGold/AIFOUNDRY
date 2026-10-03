"use client";

import React, { useState, useEffect } from "react";
import { AuthApi, type AuthUser } from "../lib/api";
import { promptGoogleSignInWeb, loadGoogleScript } from "../lib/googleAuthWeb";

interface WebAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  isEn?: boolean;
}

type AuthMode = "login" | "register";

export function WebAuthModal({
  isOpen,
  onClose,
  onSuccess,
  isEn = false,
}: WebAuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form fields
  const [registerName, setRegisterName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("+229 ");
  const [registerPassword, setRegisterPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Preload Google Identity Services SDK on modal open
  useEffect(() => {
    if (isOpen) {
      loadGoogleScript().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetFields = () => {
    setLoginIdentifier("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPhone("+229 ");
    setRegisterPassword("");
    setError("");
    setLoading(false);
    setGoogleLoading(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError(isEn ? "Please fill in all fields." : "Veuillez renseigner votre identifiant et votre mot de passe.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await AuthApi.loginWithEmail(loginIdentifier.trim(), loginPassword.trim());
      resetFields();
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || (isEn ? "Invalid credentials. Please try again." : "Identifiant ou mot de passe incorrect."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError(isEn ? "Please fill in all required fields." : "Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await AuthApi.registerWithEmail({
        name: registerName.trim(),
        username: registerUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""),
        email: registerEmail.trim().toLowerCase(),
        phone: registerPhone.trim() || undefined,
        password: registerPassword.trim(),
      });
      resetFields();
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || (isEn ? "Registration failed." : "Échec de l'inscription. Vérifiez vos informations."));
    } finally {
      setLoading(false);
    }
  };

  // REAL GOOGLE OAUTH 2.0 (Direct Google Account Chooser & Verification)
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const profile = await promptGoogleSignInWeb();
      if (!profile || !profile.email) {
        setGoogleLoading(false);
        return;
      }

      const res = await AuthApi.loginWithGoogle({
        email: profile.email,
        name: profile.name,
        googleId: profile.id,
        avatarUrl: profile.avatarUrl,
      });

      resetFields();
      onSuccess(res.user);
    } catch (err: any) {
      console.error('[GoogleAuth] Error:', err);
      if (err?.message && (err.message.includes('annulée') || err.message.includes('cancelled') || err.message.includes('popup_closed'))) {
        // User closed popup, do not show fatal error
      } else {
        setError(err?.message || (isEn ? "Google sign-in failed." : "Échec de la connexion Google."));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="oj-modal-overlay"
      onClick={() => {
        resetFields();
        onClose();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        className="oj-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "36px 32px",
          maxWidth: "460px",
          width: "100%",
          borderRadius: "16px",
          backgroundColor: "var(--oj-color-surface)",
          border: "1px solid var(--oj-color-border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => {
            resetFields();
            onClose();
          }}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "var(--oj-color-text)",
            lineHeight: 1,
            padding: "6px",
          }}
          aria-label="Fermer"
        >
          ✕
        </button>

        <div>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", letterSpacing: "0.14em" }}>
              OJARKET · AUTHENTIFICATION
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "6px 0 8px", color: "var(--oj-color-text)" }}>
              {mode === "login"
                ? isEn ? "Account Sign In" : "Connexion à votre Compte"
                : isEn ? "Create your Account" : "Créer votre Compte"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: 0 }}>
              {mode === "login"
                ? isEn ? "Welcome back. Access your orders and store." : "Bon retour parmi nous. Accédez à vos commandes et services."
                : isEn ? "Join Ojarket to buy and sell authentic products." : "Rejoignez Ojarket pour acheter ou vendre des produits d'exception."}
            </p>
          </div>

          {/* Mode Toggle Pills */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--oj-color-subtle)",
              borderRadius: "24px",
              padding: "4px",
              marginBottom: "20px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: "20px",
                backgroundColor: mode === "login" ? "var(--oj-color-surface)" : "transparent",
                color: mode === "login" ? "var(--oj-color-text)" : "var(--oj-color-muted)",
                fontWeight: mode === "login" ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: mode === "login" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {isEn ? "Sign In" : "Connexion"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: "20px",
                backgroundColor: mode === "register" ? "var(--oj-color-surface)" : "transparent",
                color: mode === "register" ? "var(--oj-color-text)" : "var(--oj-color-muted)",
                fontWeight: mode === "register" ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: mode === "register" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {isEn ? "Sign Up" : "Inscription"}
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                color: "#DC2626",
                fontSize: "13px",
                marginBottom: "16px",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          {/* Real Official Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              borderRadius: "8px",
              border: "1px solid var(--oj-color-border)",
              backgroundColor: "var(--oj-color-surface)",
              color: "var(--oj-color-text)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: (googleLoading || loading) ? "not-allowed" : "pointer",
              marginBottom: "18px",
              transition: "all 0.2s ease",
            }}
          >
            {googleLoading ? (
              <span style={{ color: "var(--oj-color-accent)", fontSize: "13px" }}>
                {isEn ? "Authenticating with Google..." : "Authentification Google en cours..."}
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {mode === "login"
                    ? isEn ? "Continue with Google" : "Continuer avec Google"
                    : isEn ? "Sign up with Google" : "S'inscrire avec Google"}
                </span>
              </>
            )}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              margin: "0 0 18px",
              color: "var(--oj-color-muted)",
              fontSize: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--oj-color-border)" }} />
            <span style={{ padding: "0 10px" }}>{isEn ? "OR WITH CREDENTIALS" : "OU PAR IDENTIFIANTS"}</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--oj-color-border)" }} />
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Email address or Username" : "Email ou Nom d'utilisateur"} *
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={isEn ? "email or username" : "votre email ou nom d'utilisateur"}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Password" : "Mot de passe"} *
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "14px",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="oj-btn-primary"
                style={{ width: "100%", height: "44px", fontSize: "14px", marginTop: "6px" }}
              >
                {loading ? (isEn ? "Signing in..." : "Connexion en cours...") : (isEn ? "Sign In →" : "Se connecter →")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Full Name" : "Nom complet"} *
                </label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder={isEn ? "Your full name" : "Votre nom et prénom"}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                    {isEn ? "Username" : "Nom d'utilisateur"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="ex: marchandojarket"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--oj-color-border)",
                      backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                    {isEn ? "Phone (WhatsApp)" : "Téléphone (WhatsApp)"}
                  </label>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--oj-color-border)",
                      backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Email Address" : "Adresse Email"} *
                </label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Password" : "Mot de passe"} *
                </label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="oj-btn-primary"
                style={{ width: "100%", height: "44px", fontSize: "14px", marginTop: "6px" }}
              >
                {loading ? (isEn ? "Creating Account..." : "Création en cours...") : (isEn ? "Create My Account →" : "Créer mon Compte →")}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--oj-color-action)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {mode === "login"
                ? isEn ? "Don't have an account? Sign up" : "Pas encore de compte ? S'inscrire"
                : isEn ? "Already have an account? Sign in" : "Vous avez déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebAuthModal;
