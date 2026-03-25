import { NextResponse } from "next/server";
import Stripe from "stripe";

// ── Stripe init (safe: null if env missing) ─────────────────────────
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// ── Package definitions (C1: 3 packages at 199€/299€/499€) ─────────
// Price IDs come from env vars — set these in Vercel after creating
// products in Stripe Dashboard.
const PACKAGES: Record<
  string,
  { name: string; priceId: string | undefined; amount: number }
> = {
  essential: {
    name: "REBUILD Esențial",
    priceId: process.env.STRIPE_PRICE_ESSENTIAL,
    amount: 19900, // 199€ in cents
  },
  premium: {
    name: "REBUILD Premium",
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    amount: 29900, // 299€ in cents
  },
  coaching: {
    name: "CYB Coaching Complet",
    priceId: process.env.STRIPE_PRICE_COACHING,
    amount: 49900, // 499€ in cents
  },
};

// ── N8: Custom duration pricing ─────────────────────────────────────
const CUSTOM_PRICE_PER_DAY_EUR = 7; // 7 EUR/day
const CUSTOM_MIN_DAYS = 14;
const CUSTOM_MAX_DAYS = 90;

interface CheckoutBody {
  packageId: string;
  customerName?: string;
  customerEmail?: string;
  // N8: custom duration (only when packageId === "custom")
  customDays?: number;
  // C6: profile fields for server-side report generation
  profileAge?: number;
  profileHeight?: number;
  profileWeight?: number;
  profileActivity?: number;
  profileGoal?: number;
  profileMoment?: number;
  // D11: COMPLET questionnaire answers for post-payment generation
  completAnswers?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    // Guard: Stripe not configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 }
      );
    }

    const body: CheckoutBody = await request.json();
    const {
      packageId, customerName, customerEmail, customDays,
      profileAge, profileHeight, profileWeight,
      profileActivity, profileGoal, profileMoment,
      completAnswers,
    } = body;

    // ── Determine line_items + package name based on packageId ────────
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let resolvedPackageName: string;
    let extraMetadata: Record<string, string> = {};

    if (packageId === "custom") {
      // ── N8: Custom duration validation ──────────────────────────────
      if (customDays == null) {
        return NextResponse.json(
          { error: "customDays is required for custom package" },
          { status: 400 }
        );
      }
      if (!Number.isInteger(customDays)) {
        return NextResponse.json(
          { error: "customDays must be an integer" },
          { status: 400 }
        );
      }
      if (customDays < CUSTOM_MIN_DAYS) {
        return NextResponse.json(
          { error: `customDays must be at least ${CUSTOM_MIN_DAYS}` },
          { status: 400 }
        );
      }
      if (customDays > CUSTOM_MAX_DAYS) {
        return NextResponse.json(
          { error: `customDays must be at most ${CUSTOM_MAX_DAYS}` },
          { status: 400 }
        );
      }

      // N8: Compute price: days × 7 EUR, in cents
      const unitAmountCents = customDays * CUSTOM_PRICE_PER_DAY_EUR * 100;
      resolvedPackageName = `Plan personalizat CYB - ${customDays} zile`;

      lineItems = [
        {
          price_data: {
            currency: "eur",
            unit_amount: unitAmountCents,
            product_data: {
              name: resolvedPackageName,
            },
          },
          quantity: 1,
        },
      ];

      extraMetadata.cyb_custom_days = String(customDays);
    } else {
      // ── Standard package flow (unchanged) ───────────────────────────
      const pkg = PACKAGES[packageId];
      if (!pkg) {
        return NextResponse.json(
          { error: "Invalid package" },
          { status: 400 }
        );
      }

      // Guard: Price ID not configured
      if (!pkg.priceId) {
        return NextResponse.json(
          { error: "Package not available yet" },
          { status: 503 }
        );
      }

      resolvedPackageName = pkg.name;
      lineItems = [
        {
          price: pkg.priceId,
          quantity: 1,
        },
      ];
    }

    // Build origin for redirect URLs
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      "https://changeyourbody.ro";

    // D11: Serialize COMPLET answers into chunked metadata keys
    // Stripe limit: 500 chars per value, 50 keys max. We use ~10 keys for profile,
    // leaving ~40 for answer chunks. Textareas are truncated to keep total safe.
    const ansMetadata: Record<string, string> = {};
    if (completAnswers && typeof completAnswers === "object") {
      try {
        // Truncate any string values (textareas) to 200 chars to keep size manageable
        const sanitized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(completAnswers)) {
          if (typeof v === "string") {
            sanitized[k] = v.slice(0, 200);
          } else {
            sanitized[k] = v;
          }
        }
        const json = JSON.stringify(sanitized);
        // Split into 500-char chunks: cyb_ans_0, cyb_ans_1, ...
        const CHUNK = 500;
        const chunks = Math.ceil(json.length / CHUNK);
        // Safety: max 20 chunks (10000 chars) to stay within Stripe key limits
        for (let i = 0; i < Math.min(chunks, 20); i++) {
          ansMetadata[`cyb_ans_${i}`] = json.slice(i * CHUNK, (i + 1) * CHUNK);
        }
        ansMetadata["cyb_ans_chunks"] = String(Math.min(chunks, 20));
      } catch {
        // Silent fail — profile data still goes through
      }
    }

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#mini-flow`,
      metadata: {
        packageId,
        customerName: customerName || "",
        // C6: profile data for server-side report generation
        ...(profileAge != null ? { cyb_age: String(profileAge) } : {}),
        ...(profileHeight != null ? { cyb_height: String(profileHeight) } : {}),
        ...(profileWeight != null ? { cyb_weight: String(profileWeight) } : {}),
        ...(profileActivity != null ? { cyb_activity: String(profileActivity) } : {}),
        ...(profileGoal != null ? { cyb_goal: String(profileGoal) } : {}),
        ...(profileMoment != null ? { cyb_moment: String(profileMoment) } : {}),
        // D11: COMPLET answers (chunked JSON)
        ...ansMetadata,
        // N8: custom duration metadata
        ...extraMetadata,
      },
    };

    // Pre-fill customer email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
