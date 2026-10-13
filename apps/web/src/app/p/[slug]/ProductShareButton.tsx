'use client';

import React, { useState } from 'react';

interface ProductShareButtonProps {
  productTitle: string;
  formattedPrice: string;
  currency: string;
  shopName?: string;
  productUrl?: string;
}

export default function ProductShareButton({
  productTitle,
  formattedPrice,
  currency,
  shopName = 'Ojarket',
  productUrl,
}: ProductShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (productUrl) return productUrl;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://www.ojarket.com';
  };

  const handleShare = async () => {
    const url = getFullUrl();
    const shareText = `Découvrez "${productTitle}" (${formattedPrice} ${currency}) chez ${shopName} sur Ojarket — Haute Marketplace Ouest-Africaine : ${url}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${productTitle} | ${shopName}`,
          text: shareText,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
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

  const handleWhatsAppShare = () => {
    const url = getFullUrl();
    const message = encodeURIComponent(
      `Découvrez cette création sur Ojarket : "${productTitle}" (${formattedPrice} ${currency}) par ${shopName}\n\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Primary Native Share / Clipboard button */}
      <button
        type="button"
        onClick={handleShare}
        className="oj-secondary-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '11px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: 'rgba(212, 180, 131, 0.08)',
          color: '#D4B483',
          border: '1px solid rgba(212, 180, 131, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          flex: 1,
        }}
        title="Partager cette création"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        <span>{copied ? 'Lien Copié !' : 'Partager'}</span>
      </button>

      {/* WhatsApp Direct Share Button */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="oj-action-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '11px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: '#075D49',
          color: '#FFFFFF',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          flex: 1,
        }}
        title="Partager directement sur WhatsApp"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981zm10.741-7.258c-.078-.13-.288-.208-.606-.366s-1.874-.925-2.164-1.031c-.29-.105-.502-.158-.713.158-.212.316-.819 1.031-.1.004 1.242-.185.211-.37.237-.687.079s-1.344-.495-2.56-1.579c-.947-.844-1.587-1.888-1.772-2.205-.185-.317-.02-.489.139-.646.143-.142.317-.37.476-.554.159-.185.212-.317.318-.528.106-.211.053-.396-.026-.554s-.713-1.717-.978-2.355c-.258-.62-.52-.536-.713-.546l-.608-.01c-.211 0-.555.079-.846.396s-1.111 1.085-1.111 2.645 1.137 3.067 1.296 3.278c.159.211 2.238 3.418 5.422 4.793.757.327 1.348.522 1.808.669.76.241 1.452.207 1.999.125.61-.092 1.874-.766 2.138-1.506.264-.74.264-1.374.185-1.506z" />
        </svg>
        <span>WhatsApp</span>
      </button>
    </div>
  );
}
