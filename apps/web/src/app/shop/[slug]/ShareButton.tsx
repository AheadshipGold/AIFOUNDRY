'use client';

import React, { useState } from 'react';

interface ShareButtonProps {
  shopName?: string;
  shopUrl?: string;
}

export default function ShareButton({ shopName = 'Boutique Ojarket', shopUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = shopUrl || (typeof window !== 'undefined' ? window.location.href : 'https://ojarket.com');
    const shareData = {
      title: `${shopName} sur Ojarket`,
      text: `Découvrez la boutique officielle "${shopName}" sur Ojarket — Marketplace E-Commerce & Pièces d'Exception : ${url}`,
      url: url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard if user dismissed or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
      onClick={handleShare} 
      className="share-btn" 
      aria-label="Partager la boutique"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        backgroundColor: '#075D49',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 700,
        boxShadow: '0 2px 8px rgba(7,93,73,0.2)',
        transition: 'all 0.2s ease',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="share-icon"
      >
        {copied ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </>
        )}
      </svg>
      {copied ? 'Lien Copié !' : 'Partager Boutique'}
    </button>
  );
}
