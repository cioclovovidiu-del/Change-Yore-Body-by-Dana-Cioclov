"use client";

import { useState, useEffect, useCallback } from "react";

const CONSENT_KEY = "cyb_cookie_consent";

type ConsentValue = "accepted" | "rejected";

/**
 * Cookie consent banner for analytics/pixel (GDPR Phase 0).
 * - Shows once per browser until user accepts or rejects.
 * - If accepted: loads gtag + fbq scripts dynamically.
 * - If rejected: no analytics scripts are loaded.
 * - Consent choice stored in localStorage.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    } else if (stored === "accepted") {
      enableAnalytics();
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted" satisfies ConsentValue);
    setVisible(false);
    enableAnalytics();
  }, []);

  const handleReject = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "rejected" satisfies ConsentValue);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#141e29",
        borderTop: "1px solid rgba(201,168,76,0.2)",
        padding: "16px 20px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      <p style={{ color: "#ccc", fontSize: 13, margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
        Folosim cookie-uri pentru a analiza traficul și a îmbunătăți experiența ta.{" "}
        <a
          href="/confidentialitate"
          style={{ color: "#C9A84C", textDecoration: "underline" }}
        >
          Politica de Confidențialitate
        </a>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleAccept}
          style={{
            padding: "8px 20px",
            background: "#C9A84C",
            color: "#0f1923",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          style={{
            padding: "8px 20px",
            background: "transparent",
            color: "#888",
            border: "1px solid #444",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Refuz
        </button>
      </div>
    </div>
  );
}

/**
 * Dynamically inject Google Analytics and Facebook Pixel scripts.
 * Only called when the user has accepted cookies.
 */
function enableAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  // Google Analytics
  if (GA_ID && !document.getElementById("cyb-gtag")) {
    const script = document.createElement("script");
    script.id = "cyb-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const init = document.createElement("script");
    init.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { anonymize_ip: true });
      window.gtag = gtag;
    `;
    document.head.appendChild(init);
  }

  // Facebook Pixel
  if (FB_PIXEL_ID && !document.getElementById("cyb-fbq")) {
    const script = document.createElement("script");
    script.id = "cyb-fbq";
    script.textContent = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }
}
