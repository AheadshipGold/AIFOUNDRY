"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./landing.css"; // Ensure access to global styles

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="theme-dark" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--oj-color-canvas)",
      color: "var(--oj-color-text)",
      fontFamily: "var(--oj-font-ui)",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        marginBottom: "2rem"
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--oj-color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      
      <h1 style={{
        fontFamily: "var(--oj-font-editorial)",
        fontSize: "3rem",
        fontWeight: 400,
        marginBottom: "1rem",
        letterSpacing: "-0.02em"
      }}>
        Page Introuvable
      </h1>
      
      <p style={{
        fontSize: "1.1rem",
        color: "var(--oj-color-muted)",
        maxWidth: "400px",
        lineHeight: 1.6,
        marginBottom: "3rem"
      }}>
        L'adresse que vous cherchez n'existe pas ou a été déplacée. Le prestige Ojarket reste à votre portée.
      </p>

      <Link 
        href="/" 
        className="oj-btn-primary"
        style={{
          padding: "16px 32px",
          fontSize: "1rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Retour à l'Accueil
      </Link>
    </div>
  );
}
