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

// ── Navigation events ───────────────────────────────────────────────────

export function trackQuestionnaireStart(): void {
  _gtag("event", "questionnaire_start", { event_category: "funnel" });
  _fbq("trackCustom", "QuestionnaireStart");
}

export function trackEmailProvided(): void {
  _gtag("event", "email_provided", { event_category: "funnel", has_email: true });
  _fbq("trackCustom", "EmailProvided", { has_email: true });
}

export function trackMiniStep(stepId: string, stepIndex: number): void {
  _gtag("event", "mini_step", { event_category: "funnel", step_id: stepId, step_index: stepIndex });
  _fbq("trackCustom", "MiniStep", { step_id: stepId, step_index: stepIndex });
}

export function trackCompletStart(route: string): void {
  _gtag("event", "complet_start", { event_category: "funnel", route });
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

// ── Checkout events ─────────────────────────────────────────────────────

export function trackBeginCheckout(packageId: string): void {
  _gtag("event", "begin_checkout", { event_category: "purchase", package: packageId });
  _fbq("track", "InitiateCheckout", { content_name: packageId });
}

// ── Custom duration events ──────────────────────────────────────────────

export function trackCustomDurationInteraction(days: number, source: "preset" | "input"): void {
  _gtag("event", "custom_duration_interaction", { event_category: "custom_package", days, source });
}

export function trackCustomCheckoutClick(days: number, price: number, route?: string): void {
  _gtag("event", "custom_checkout_click", { event_category: "custom_package", days, price, route, source: "custom" });
  _fbq("trackCustom", "CustomCheckoutClick", { days, price });
}

// ── WhatsApp click events ───────────────────────────────────────────────

export function trackWhatsAppClick(source: string): void {
  _gtag("event", "whatsapp_click", { source });
  _fbq("track", "Contact");
}
