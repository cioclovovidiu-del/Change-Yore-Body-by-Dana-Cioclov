import { NextResponse } from "next/server";
import Stripe from "stripe";

// ── Stripe init ──────────────────────────────────────────────────────
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// ── Auth guard ───────────────────────────────────────────────────────
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

function isAuthorized(request: Request): boolean {
  if (!ADMIN_API_KEY) return false;

  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${ADMIN_API_KEY}`) return true;

  // Check query param fallback (for quick browser access)
  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key");
  if (keyParam === ADMIN_API_KEY) return true;

  return false;
}

// ── Package display names ────────────────────────────────────────────
const PACKAGE_NAMES: Record<string, string> = {
  essential: "REBUILD Esential (199€)",
  premium: "REBUILD Premium (299€)",
  coaching: "CYB Coaching Complet (499€)",
};

// ── GET /api/admin/orders ────────────────────────────────────────────
// Returns recent paid checkout sessions from Stripe.
// Protected by ADMIN_API_KEY env var.
//
// Query params:
//   key       — admin API key (alt: Authorization: Bearer <key>)
//   limit     — number of orders to return (default 20, max 100)
//
export async function GET(request: Request) {
  // Guard: Stripe not configured
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 503 }
    );
  }

  // Guard: ADMIN_API_KEY not set
  if (!ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "Admin access not configured" },
      { status: 503 }
    );
  }

  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
    const limit = Math.min(Math.max(limitParam, 1), 100);

    // Query Stripe for recent paid checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit,
      status: "complete",
      expand: ["data.line_items"],
    });

    // Map to a clean response format
    const orders = sessions.data
      .filter((s) => s.payment_status === "paid")
      .map((s) => {
        const packageId = s.metadata?.packageId || "";
        // N12: Resolve custom package name dynamically from metadata
        let packageName: string;
        if (packageId === "custom") {
          const rawDays = s.metadata?.cyb_custom_days;
          const days = rawDays ? Number(rawDays) : null;
          packageName = days && Number.isInteger(days) && days >= 1
            ? `Plan personalizat CYB - ${days} zile`
            : "Plan personalizat CYB";
        } else {
          packageName = PACKAGE_NAMES[packageId] || `Unknown (${packageId || "no-id"})`;
        }

        return {
          sessionId: s.id,
          packageId,
          packageName,
          customerEmail:
            s.customer_email || s.customer_details?.email || null,
          customerName:
            s.metadata?.customerName ||
            s.customer_details?.name ||
            "",
          amountTotal: s.amount_total,
          currency: s.currency,
          paymentStatus: s.payment_status,
          createdAt: new Date((s.created || 0) * 1000).toISOString(),

          // C4 fulfillment metadata
          fulfilled: s.metadata?.cyb_fulfilled === "true",
          fulfilledAt: s.metadata?.cyb_fulfilled_at || null,
          fulfillmentVersion: s.metadata?.cyb_fulfillment_version || null,
          deliveryType: s.metadata?.cyb_delivery_type || null,

          // C5 delivery result
          deliveryStatus: s.metadata?.cyb_delivery_status || null,
          assetsDelivered: s.metadata?.cyb_assets_delivered
            ? s.metadata.cyb_assets_delivered.split(",").filter(Boolean)
            : [],
          assetsPending: s.metadata?.cyb_assets_pending
            ? s.metadata.cyb_assets_pending.split(",").filter(Boolean)
            : [],
          deliveryMessage: s.metadata?.cyb_delivery_message || null,
        };
      });

    return NextResponse.json({
      orders,
      count: orders.length,
      queriedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[admin/orders] Error querying Stripe:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
