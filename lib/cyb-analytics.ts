// =============================================================================
// CYB Analytics — Safe wrappers for gtag/fbq
// Guards against missing globals. No side effects beyond event dispatch.
// =============================================================================

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

function _gtag(...args: any[]): void {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag(...args);
    }
  } catch { /* swallow */ }
}

function _fbq(...args: any[]): void {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq(...args);
    }
  } catch { /* swallow */ }
}

// ── Results events ──────────────────────────────────────────────────────

export function trackMiniComplete(route: string, bmi: string): void {
  _gtag("event", "mini_complete", { event_category: "funnel", route, bmi });
  _fbq("track", "Lead");
}

export function trackCompletComplete(route: string): void {
  _gtag("event", "complet_complete", { event_category: "funnel", route });
  _fbq("track", "CompleteRegistration");
}

// ── WhatsApp click events ───────────────────────────────────────────────

export function trackWhatsAppClick(source: string): void {
  _gtag("event", "whatsapp_click", { source });
  _fbq("track", "Contact");
}
