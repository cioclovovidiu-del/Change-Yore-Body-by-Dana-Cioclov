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

interface CheckoutBody {
  packageId: string;
  customerName?: string;
  customerEmail?: string;
  // C6: profile fields for server-side report generation
  profileAge?: number;
  profileHeight?: number;
  profileWeight?: number;
  profileActivity?: number;
  profileGoal?: number;
  profileMoment?: number;
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
      packageId, customerName, customerEmail,
      profileAge, profileHeight, profileWeight,
      profileActivity, profileGoal, profileMoment,
    } = body;

    // Validate package
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

    // Build origin for redirect URLs
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      "https://changeyourbody.ro";

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: pkg.priceId,
          quantity: 1,
        },
      ],
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
