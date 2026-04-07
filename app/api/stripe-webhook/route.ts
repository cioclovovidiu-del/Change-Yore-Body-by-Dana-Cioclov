import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import {
  extractProfile,
  extractCompletAnswers,
  buildMetabolicReportHtml,
  escapeHtml,
  type CustomerProfile,
} from "@/lib/metabolic-report";
import { emailFrom, emailReplyTo, DANIELA_EMAIL, listUnsubscribeHeaders, emailLegalFooterHtml } from "@/lib/email-config";

// ── Stripe init (safe: null if env missing) ─────────────────────────
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// ── Resend init (reuse existing provider from send-email route) ─────
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// ── Package reverse-lookup (Price ID → internal package) ────────────
const PRICE_TO_PACKAGE: Record<string, string> = {};
if (process.env.STRIPE_PRICE_ESSENTIAL)
  PRICE_TO_PACKAGE[process.env.STRIPE_PRICE_ESSENTIAL] = "essential";
if (process.env.STRIPE_PRICE_PREMIUM)
  PRICE_TO_PACKAGE[process.env.STRIPE_PRICE_PREMIUM] = "premium";
if (process.env.STRIPE_PRICE_COACHING)
  PRICE_TO_PACKAGE[process.env.STRIPE_PRICE_COACHING] = "coaching";

const PACKAGE_NAMES: Record<string, string> = {
  essential: "REBUILD Esențial (199€)",
  premium: "REBUILD Premium (299€)",
  coaching: "CYB Coaching Complet (499€)",
  // N9: custom is resolved dynamically from metadata — see resolveCustomPackageName()
};

// N9: Build dynamic package name for custom duration
function resolveCustomPackageName(metadata: Record<string, string> | null | undefined): string {
  const days = _parseCustomDays(metadata);
  if (days) return `Plan personalizat CYB - ${days} zile`;
  return "Plan personalizat CYB";
}

// N9: Safely parse cyb_custom_days from metadata
function _parseCustomDays(metadata: Record<string, string> | null | undefined): number | null {
  if (!metadata) return null;
  const raw = metadata.cyb_custom_days;
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

// ── C3: Package → delivery intent mapping ───────────────────────────
interface DeliveryIntent {
  type: string;
  label: string;
  includes: string[];
  nextSteps: string[];
}

const DELIVERY_INTENTS: Record<string, DeliveryIntent> = {
  essential: {
    type: "digital_plan",
    label: "Plan digital esențial",
    includes: [
      "Plan alimentar personalizat 7 zile",
      "Program antrenament 4 săptămâni",
      "Raport personalizat cu profilul tău",
    ],
    nextSteps: [
      "Daniela va analiza profilul tău complet",
      "Primești planul pe email în maximum 24h",
      "Începi transformarea cu ghid clar",
    ],
  },
  premium: {
    type: "premium_plan",
    label: "Plan premium complet",
    includes: [
      "Plan alimentar personalizat 30 zile",
      "Program antrenament 12 săptămâni",
      "Raport complet cu analiza detaliată",
      "Suport WhatsApp dedicat 30 zile",
    ],
    nextSteps: [
      "Daniela va analiza profilul tău complet",
      "Primești planul pe email în maximum 24h",
      "Ai acces la suport WhatsApp direct cu Daniela",
      "Ajustări incluse pe parcursul celor 30 de zile",
    ],
  },
  coaching: {
    type: "coaching_onboarding",
    label: "Coaching complet cu Daniela",
    includes: [
      "Tot ce include Premium",
      "Coaching 1:1 cu Daniela",
      "Ajustări săptămânale personalizate",
      "Acces comunitate VIP",
    ],
    nextSteps: [
      "Daniela te va contacta personal în 24h",
      "Prima sesiune de coaching se programează imediat",
      "Primești planul complet + acces comunitate VIP",
      "Ajustări săptămânale pe toată durata programului",
    ],
  },
};

// N9: Custom delivery intent is built dynamically — see resolveDeliveryIntent()

const DEFAULT_INTENT: DeliveryIntent = {
  type: "unknown",
  label: "Pachet necunoscut",
  includes: ["Planul achiziționat"],
  nextSteps: ["Daniela te va contacta în maximum 24h"],
};

// ── In-memory idempotency set (per-instance, resets on cold start) ──
const processedSessions = new Set<string>();
const MAX_PROCESSED = 1000;

function markProcessed(sessionId: string): boolean {
  if (processedSessions.has(sessionId)) return false;
  if (processedSessions.size >= MAX_PROCESSED) {
    const first = processedSessions.values().next().value;
    if (first !== undefined) processedSessions.delete(first);
  }
  processedSessions.add(sessionId);
  return true;
}

// ── C3: Extended fulfillment payload ────────────────────────────────
interface FulfillmentPayload {
  sessionId: string;
  packageId: string;
  packageName: string;
  customerEmail: string | null;
  customerName: string;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string;
  purchasedAt: string;
  source: "stripe_checkout";
  fulfillmentVersion: string;
  deliveryIntent: DeliveryIntent;
}

const FULFILLMENT_VERSION = "C7-1.0.0";

// ── C5: Asset manifest per package ───────────────────────────────────
// Defines what each package promises. status reflects real capability:
// "pending_manual" = Daniela delivers manually (no server-side generator)
// "delivered"      = automated delivery completed
// "not_applicable" = human-only service, not a digital asset

interface AssetEntry {
  id: string;
  label: string;
  status: "pending_manual" | "delivered" | "not_applicable";
  channel: "email" | "whatsapp" | "manual" | "platform";
  note: string;
}

const PACKAGE_ASSETS: Record<string, AssetEntry[]> = {
  essential: [
    { id: "meal_plan_7d", label: "Plan alimentar 7 zile", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "training_4w", label: "Program antrenament 4 săptămâni", status: "delivered", channel: "email", note: "Phase 3: Automated 4-week plan via buildTrainingPlan4Weeks — included in metabolic report" },
    { id: "profile_report", label: "Raport metabolic personalizat", status: "delivered", channel: "email", note: "Automated via C6 — server-side calc from real profile data" },
    { id: "confirmation_email", label: "Email confirmare comandă", status: "delivered", channel: "email", note: "Automated via Resend (C3)" },
  ],
  premium: [
    { id: "meal_plan_30d", label: "Plan alimentar 30 zile", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "training_12w", label: "Program antrenament 12 săptămâni", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "full_report", label: "Raport complet analiză detaliată", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "profile_report", label: "Raport metabolic personalizat", status: "delivered", channel: "email", note: "D10: Automated via C6 — server-side calc from real profile data" },
    { id: "whatsapp_support_30d", label: "Suport WhatsApp 30 zile", status: "not_applicable", channel: "whatsapp", note: "Human service — Daniela initiates contact" },
    { id: "confirmation_email", label: "Email confirmare comandă", status: "delivered", channel: "email", note: "Automated via Resend (C3)" },
  ],
  coaching: [
    { id: "meal_plan_30d", label: "Plan alimentar 30 zile", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "training_12w", label: "Program antrenament 12 săptămâni", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "full_report", label: "Raport complet analiză detaliată", status: "pending_manual", channel: "email", note: "Daniela generates manually from questionnaire data" },
    { id: "profile_report", label: "Raport metabolic personalizat", status: "delivered", channel: "email", note: "D10: Automated via C6 — server-side calc from real profile data" },
    { id: "coaching_1on1", label: "Coaching 1:1 cu Daniela", status: "not_applicable", channel: "manual", note: "Human service — Daniela schedules first session" },
    { id: "weekly_adjustments", label: "Ajustări săptămânale personalizate", status: "not_applicable", channel: "manual", note: "Human service — ongoing throughout program" },
    { id: "vip_community", label: "Acces comunitate VIP", status: "not_applicable", channel: "platform", note: "Human service — Daniela grants access" },
    { id: "whatsapp_support", label: "Suport WhatsApp dedicat", status: "not_applicable", channel: "whatsapp", note: "Human service — Daniela initiates contact" },
    { id: "confirmation_email", label: "Email confirmare comandă", status: "delivered", channel: "email", note: "Automated via Resend (C3)" },
  ],
  // N9: Custom package assets — meal plan days are dynamic but asset manifest is fixed
  custom: [
    { id: "meal_plan_custom", label: "Plan alimentar personalizat", status: "pending_manual", channel: "email", note: "N9: Duration set by cyb_custom_days metadata" },
    { id: "profile_report", label: "Raport metabolic personalizat", status: "delivered", channel: "email", note: "N9: Automated — includes N-day nutrition plan" },
    { id: "confirmation_email", label: "Email confirmare comandă", status: "delivered", channel: "email", note: "Automated via Resend (C3)" },
  ],
};

const DEFAULT_ASSETS: AssetEntry[] = [
  { id: "confirmation_email", label: "Email confirmare comandă", status: "delivered", channel: "email", note: "Automated via Resend (C3)" },
];

// ── C5: Delivery result structure ────────────────────────────────────
interface DeliveryResult {
  sessionId: string;
  packageId: string;
  deliveryIntentType: string;
  assetsResolved: string[];
  assetsDelivered: string[];
  assetsPending: string[];
  deliveryStatus: "partial" | "complete" | "manual_required";
  deliveryMessage: string;
  deliveredAt: string;
  fulfillmentVersion: string;
}

function buildDeliveryResult(
  payload: FulfillmentPayload,
  emailSent: boolean,
  profileReportSent: boolean = false
): DeliveryResult {
  const assets = PACKAGE_ASSETS[payload.packageId] || DEFAULT_ASSETS;
  const now = new Date().toISOString();

  const resolved = assets.map((a) => a.id);
  const delivered: string[] = [];
  const pending: string[] = [];

  for (const asset of assets) {
    if (asset.id === "confirmation_email") {
      if (emailSent) delivered.push(asset.id);
      else pending.push(asset.id);
    } else if (asset.id === "profile_report" && asset.status === "delivered") {
      // C6/D10: profile_report is "delivered" in manifest for all packages
      // actual delivery depends on whether we had profile data + sent it
      if (profileReportSent) delivered.push(asset.id);
      else pending.push(asset.id);
    } else if (asset.id === "training_4w" && asset.status === "delivered") {
      // Phase 3: training_4w is embedded in the metabolic report — delivered when report is sent
      if (profileReportSent) delivered.push(asset.id);
      else pending.push(asset.id);
    } else if (asset.status === "delivered") {
      // Future auto-delivered assets
      delivered.push(asset.id);
    } else if (asset.status === "not_applicable") {
      // Human services — counted as pending until Daniela confirms
      pending.push(asset.id);
    } else {
      pending.push(asset.id);
    }
  }

  const allDelivered = pending.length === 0;
  const noneDelivered = delivered.length === 0;

  let deliveryStatus: DeliveryResult["deliveryStatus"];
  let deliveryMessage: string;

  if (allDelivered) {
    deliveryStatus = "complete";
    deliveryMessage = "All assets delivered automatically.";
  } else if (noneDelivered) {
    deliveryStatus = "manual_required";
    deliveryMessage = `All ${pending.length} asset(s) require manual delivery by Daniela.`;
  } else {
    deliveryStatus = "partial";
    deliveryMessage = `${delivered.length} asset(s) delivered automatically, ${pending.length} pending manual delivery by Daniela.`;
  }

  return {
    sessionId: payload.sessionId,
    packageId: payload.packageId,
    deliveryIntentType: payload.deliveryIntent.type,
    assetsResolved: resolved,
    assetsDelivered: delivered,
    assetsPending: pending,
    deliveryStatus,
    deliveryMessage,
    deliveredAt: now,
    fulfillmentVersion: FULFILLMENT_VERSION,
  };
}

// ── C4: Persistent idempotency via Stripe metadata ──────────────────
// Checks if session was already fulfilled by looking at metadata flag.
// This survives cold starts (unlike in-memory Set which is fast-path only).
async function isAlreadyFulfilled(
  stripeClient: Stripe,
  sessionId: string
): Promise<boolean> {
  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    return session.metadata?.cyb_fulfilled === "true";
  } catch {
    return false; // If we can't check, allow processing (safe default)
  }
}

// Marks session as fulfilled in Stripe metadata (persistent record).
// C5: Now includes delivery result summary for admin visibility.
async function markFulfilledInStripe(
  stripeClient: Stripe,
  sessionId: string,
  packageId: string,
  deliveryType: string,
  deliveryResult?: DeliveryResult
): Promise<void> {
  try {
    await stripeClient.checkout.sessions.update(sessionId, {
      metadata: {
        cyb_fulfilled: "true",
        cyb_fulfilled_at: new Date().toISOString(),
        cyb_fulfillment_version: FULFILLMENT_VERSION,
        cyb_delivery_type: deliveryType,
        packageId,
        // C5: delivery result summary (Stripe metadata values max 500 chars)
        ...(deliveryResult
          ? {
              cyb_delivery_status: deliveryResult.deliveryStatus,
              cyb_assets_delivered: deliveryResult.assetsDelivered.join(","),
              cyb_assets_pending: deliveryResult.assetsPending.join(","),
              cyb_delivery_message: deliveryResult.deliveryMessage.slice(0, 490),
            }
          : {}),
      },
    });
  } catch (err) {
    console.error(
      `[stripe-webhook] Failed to mark session ${sessionId} as fulfilled:`,
      err
    );
    // Non-fatal: fulfillment already happened, this is just the persistence marker
  }
}

// ── C3: Customer confirmation email ─────────────────────────────────
function buildCustomerConfirmationHtml(payload: FulfillmentPayload): string {
  const name = escapeHtml(payload.customerName || "");
  const greeting = name ? `Dragă ${name},` : "Bună,";
  const intent = payload.deliveryIntent;

  const includesHtml = intent.includes
    .map((item) => `<li style="padding:4px 0;color:#e0e0e0;">${escapeHtml(item)}</li>`)
    .join("");

  const stepsHtml = intent.nextSteps
    .map(
      (step, i) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">${i + 1}.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">${escapeHtml(step)}</td></tr>`
    )
    .join("");

  const amountStr =
    payload.amountTotal !== null
      ? `${(payload.amountTotal / 100).toFixed(2)} ${(payload.currency || "eur").toUpperCase()}`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#C9A84C;font-size:24px;margin:0 0 4px;">Change Your Body</h1>
      <p style="color:#666;font-size:13px;margin:0;">Confirmare comandă</p>
    </div>

    <div style="background:#141e29;border-radius:16px;padding:28px 24px;border:1px solid rgba(201,168,76,0.15);">
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 16px;">${greeting}</p>
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Mulțumim pentru încredere! Plata ta a fost procesată cu succes.
      </p>

      <div style="background:rgba(201,168,76,0.06);border-radius:10px;padding:16px;border:1px solid rgba(201,168,76,0.12);margin-bottom:20px;">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 8px;">Pachetul tău</p>
        <p style="color:white;font-size:17px;font-weight:600;margin:0 0 4px;">${escapeHtml(payload.packageName)}</p>
        ${amountStr ? `<p style="color:#888;font-size:13px;margin:0;">Total: ${escapeHtml(amountStr)}</p>` : ""}
      </div>

      <p style="color:#999;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin:0 0 8px;">Ce primești:</p>
      <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.8;">
        ${includesHtml}
      </ul>

      <p style="color:#999;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin:0 0 10px;">Ce urmează:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${stepsHtml}
      </table>

      <div style="text-align:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#999;font-size:13px;margin:0 0 12px;">Ai întrebări? Scrie-i Danielei direct:</p>
        <a href="https://wa.me/40721333040?text=Bun%C4%83%20Daniela,%20tocmai%20am%20finalizat%20plata%20pentru%20${encodeURIComponent(payload.packageName)}." style="display:inline-block;padding:10px 24px;background:rgba(37,211,102,0.12);color:#25D366;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid rgba(37,211,102,0.2);">Scrie pe WhatsApp →</a>
      </div>
    </div>

    ${emailLegalFooterHtml()}
  </div>
</body>
</html>`;
}

// ── C3: Internal notification email (to Daniela) ────────────────────
function buildInternalNotificationHtml(payload: FulfillmentPayload): string {
  const amountStr =
    payload.amountTotal !== null
      ? `${(payload.amountTotal / 100).toFixed(2)} ${(payload.currency || "eur").toUpperCase()}`
      : "N/A";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="color:#C9A84C;font-size:20px;margin-bottom:4px;">💰 Plată nouă CYB!</h1>
    <p style="color:#888;font-size:13px;margin-top:0;">${escapeHtml(new Date().toLocaleString("ro-RO"))}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Pachet</td><td style="padding:8px;color:#fff;font-weight:600;border-bottom:1px solid #2a2a2a;">${escapeHtml(payload.packageName)}</td></tr>
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Suma</td><td style="padding:8px;color:#C9A84C;font-weight:700;border-bottom:1px solid #2a2a2a;">${escapeHtml(amountStr)}</td></tr>
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Client</td><td style="padding:8px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(payload.customerName || "—")}</td></tr>
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Email</td><td style="padding:8px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(payload.customerEmail || "—")}</td></tr>
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Tip livrare</td><td style="padding:8px;color:#2AA5A0;border-bottom:1px solid #2a2a2a;">${escapeHtml(payload.deliveryIntent.type)}</td></tr>
      <tr><td style="padding:8px;color:#999;border-bottom:1px solid #2a2a2a;">Session ID</td><td style="padding:8px;color:#666;font-size:12px;border-bottom:1px solid #2a2a2a;">${escapeHtml(payload.sessionId)}</td></tr>
    </table>
    <p style="margin-top:16px;color:#666;font-size:12px;">Fulfillment v${escapeHtml(FULFILLMENT_VERSION)} · source: stripe_checkout</p>
  </div>
</body>
</html>`;
}

// ── C3/C5/C6/C7: Fulfillment trigger (returns DeliveryResult) ───────
async function triggerFulfillment(
  payload: FulfillmentPayload,
  profile: CustomerProfile | null,
  completAnswers?: Record<string, unknown> | null,
  reportDays?: number | null
): Promise<DeliveryResult> {
  let customerEmailSent = false;
  let profileReportSent = false;

  // 1. Structured log (always — observability baseline)
  // N16: Enrich with custom-duration analytics fields
  const isCustom = payload.packageId === "custom";
  const logEnrichment: Record<string, unknown> = { isCustom };
  if (isCustom && reportDays) {
    logEnrichment.customDays = reportDays;
    logEnrichment.pricePerDay = payload.amountTotal ? Math.round((payload.amountTotal / 100) / reportDays) : null;
  }
  if (payload.amountTotal != null) {
    logEnrichment.priceTotal = payload.amountTotal / 100;
  }
  console.log(
    JSON.stringify({
      event: "CYB_PAYMENT_FULFILLED",
      ...payload,
      deliveryIntent: payload.deliveryIntent.type,
      ...logEnrichment,
    })
  );

  // 2. Customer confirmation email (if Resend + customer email available)
  if (resend && payload.customerEmail) {
    try {
      const { error } = await resend.emails.send({
        from: emailFrom(),
        replyTo: emailReplyTo,
        to: payload.customerEmail,
        subject: `Confirmare comandă — ${payload.packageName}`,
        html: buildCustomerConfirmationHtml(payload),
        headers: listUnsubscribeHeaders(),
      });
      if (error) {
        console.error("[fulfillment] Customer email failed:", error);
      } else {
        customerEmailSent = true;
        console.log(
          `[fulfillment] Customer confirmation sent to ${payload.customerEmail}`
        );
      }
    } catch (err) {
      console.error("[fulfillment] Customer email exception:", err);
    }
  } else if (!resend) {
    console.log("[fulfillment] Resend not configured — skipping customer email");
  } else {
    console.log("[fulfillment] No customer email — skipping confirmation");
  }

  // 3. Internal notification to Daniela (if Resend available)
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: emailFrom(),
        to: DANIELA_EMAIL,
        subject: `💰 Plată nouă: ${payload.packageName} — ${payload.customerName || "Client"}`,
        html: buildInternalNotificationHtml(payload),
      });
      if (error) {
        console.error("[fulfillment] Internal notification failed:", error);
      } else {
        console.log("[fulfillment] Internal notification sent");
      }
    } catch (err) {
      console.error("[fulfillment] Internal notification exception:", err);
    }
  }

  // 4. C6/C7/D10: Metabolic profile report (all paid packages)
  if (
    resend &&
    payload.customerEmail &&
    profile
  ) {
    try {
      // C7: Build report URL for browser viewing
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://changeyourbody.ro";
      const reportUrl = `${siteUrl}/report?sid=${encodeURIComponent(payload.sessionId)}`;

      const reportHtml = buildMetabolicReportHtml({
        customerName: payload.customerName,
        packageName: payload.packageName,
        profile,
        mode: "email",
        reportUrl,
        completAnswers,
        // N9: pass custom days for dynamic plan generation
        ...(reportDays ? { days: reportDays } : {}),
      });
      const { error } = await resend.emails.send({
        from: emailFrom(),
        replyTo: emailReplyTo,
        to: payload.customerEmail,
        subject: `Raportul tău metabolic personalizat — Change Your Body`,
        html: reportHtml,
        headers: listUnsubscribeHeaders(),
      });
      if (error) {
        console.error("[fulfillment] Metabolic report email failed:", error);
      } else {
        profileReportSent = true;
        console.log(
          `[fulfillment] Metabolic report sent to ${payload.customerEmail}`
        );
      }
    } catch (err) {
      console.error("[fulfillment] Metabolic report exception:", err);
    }
  } else if (!profile) {
    console.log(
      "[fulfillment] No profile data available — metabolic report skipped (pending manual)"
    );
  }

  // 5. C5/C6: Build deterministic delivery result
  const deliveryResult = buildDeliveryResult(payload, customerEmailSent, profileReportSent);

  // 6. C5: Structured delivery result log (N16: enriched)
  console.log(
    JSON.stringify({
      event: "CYB_DELIVERY_RESULT",
      ...deliveryResult,
      ...logEnrichment,
    })
  );

  // 7. Delivery payload log (structured, for future DB/queue integration) (N16: enriched)
  console.log(
    JSON.stringify({
      event: "CYB_DELIVERY_READY",
      sessionId: payload.sessionId,
      packageId: payload.packageId,
      deliveryType: payload.deliveryIntent.type,
      customerEmail: payload.customerEmail,
      purchasedAt: payload.purchasedAt,
      fulfillmentVersion: payload.fulfillmentVersion,
      ...logEnrichment,
    })
  );

  return deliveryResult;
}

// ── Webhook handler ─────────────────────────────────────────────────

export async function POST(request: Request) {
  // Guard: Stripe not configured
  if (!stripe) {
    console.error("[stripe-webhook] STRIPE_SECRET_KEY not set");
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 503 }
    );
  }

  // Guard: Webhook secret not configured
  if (!WEBHOOK_SECRET) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  // Read raw body for signature verification
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read body" },
      { status: 400 }
    );
  }

  // Verify Stripe signature
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── Handle events ───────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Idempotency check — fast path (in-memory)
      if (!markProcessed(session.id)) {
        console.log(
          `[stripe-webhook] Duplicate session ${session.id} (in-memory) — skipping`
        );
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Idempotency check — persistent path (Stripe metadata, survives cold starts)
      if (await isAlreadyFulfilled(stripe, session.id)) {
        console.log(
          `[stripe-webhook] Duplicate session ${session.id} (Stripe metadata) — skipping`
        );
        return NextResponse.json({ received: true, duplicate: true, source: "persistent" });
      }

      // Only process paid sessions
      if (session.payment_status !== "paid") {
        console.log(
          `[stripe-webhook] Session ${session.id} not paid (${session.payment_status}) — skipping`
        );
        return NextResponse.json({ received: true, status: "unpaid" });
      }

      // Resolve package ID
      let packageId = session.metadata?.packageId || "";

      if (!packageId && session.line_items) {
        // Fallback stub — metadata.packageId should always be set by C1
      }

      // If still no packageId, try expanding line_items from Stripe
      if (!packageId) {
        try {
          const expanded = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ["line_items"] }
          );
          const firstItem = expanded.line_items?.data?.[0];
          const priceId =
            typeof firstItem?.price === "string"
              ? firstItem.price
              : firstItem?.price?.id;
          if (priceId) {
            packageId = PRICE_TO_PACKAGE[priceId] || "";
          }
        } catch {
          console.error(
            `[stripe-webhook] Failed to expand line_items for ${session.id}`
          );
        }
      }

      // N9: Resolve package name — custom gets dynamic name from metadata
      const packageName = packageId === "custom"
        ? resolveCustomPackageName(session.metadata)
        : (PACKAGE_NAMES[packageId] || `Unknown (${packageId || "no-id"})`);

      // N9: Read custom days for downstream use
      const customDays = packageId === "custom" ? _parseCustomDays(session.metadata) : null;

      // C3/N9: Resolve delivery intent — custom gets dynamic intent
      let deliveryIntent: DeliveryIntent;
      if (packageId === "custom" && customDays) {
        deliveryIntent = {
          type: "custom_plan",
          label: `Plan personalizat ${customDays} zile`,
          includes: [
            `Plan alimentar personalizat ${customDays} zile`,
            "Raport metabolic personalizat",
          ],
          nextSteps: [
            "Raportul tău metabolic este generat automat",
            "Daniela va analiza profilul tău complet",
            `Primești planul alimentar pe ${customDays} zile pe email`,
          ],
        };
      } else {
        deliveryIntent = DELIVERY_INTENTS[packageId] || DEFAULT_INTENT;
      }

      // Build fulfillment payload (C3 extended)
      const payload: FulfillmentPayload = {
        sessionId: session.id,
        packageId,
        packageName,
        customerEmail:
          session.customer_email ||
          session.customer_details?.email ||
          null,
        customerName:
          session.metadata?.customerName ||
          session.customer_details?.name ||
          "",
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        purchasedAt: new Date().toISOString(),
        source: "stripe_checkout",
        fulfillmentVersion: FULFILLMENT_VERSION,
        deliveryIntent,
      };

      // C6: Extract profile from Stripe session metadata for report generation
      const customerProfile = extractProfile(session.metadata);

      // D11: Extract COMPLET questionnaire answers from chunked metadata
      const completAnswers = extractCompletAnswers(session.metadata);

      console.log(
        `[stripe-webhook] Payment confirmed: ${packageName} [${deliveryIntent.type}] — ${payload.customerEmail || "no-email"} — profile: ${customerProfile ? "available" : "missing"} — completAnswers: ${completAnswers ? Object.keys(completAnswers).length + " keys" : "none"}`
      );

      // C3/C5/C6/N9: fulfillment (emails + report + delivery result)
      const deliveryResult = await triggerFulfillment(payload, customerProfile, completAnswers, customDays);

      // C4: Mark as fulfilled in Stripe metadata (persistent idempotency)
      // C5: Include delivery summary in metadata
      await markFulfilledInStripe(
        stripe,
        session.id,
        packageId,
        deliveryIntent.type,
        deliveryResult
      );

      return NextResponse.json({
        received: true,
        fulfilled: true,
        deliveryStatus: deliveryResult.deliveryStatus,
      });
    }

    default: {
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
      return NextResponse.json({ received: true });
    }
  }
}
