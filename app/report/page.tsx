import Stripe from "stripe";
import {
  extractProfile,
  buildMetabolicReportHtml,
} from "@/lib/metabolic-report";

// ── C7: Browser-viewable metabolic report for Essential ─────────────
// Access: via unguessable Stripe session ID (64+ char random string)
// Data: regenerated from Stripe session metadata (same as C6 email)
// Guard: must be fulfilled Essential session with valid profile data

// Disable static generation — this page is always dynamic
export const dynamic = "force-dynamic";
// Ensure Node.js runtime (full env var access, not Edge)
export const runtime = "nodejs";

const PACKAGE_NAMES: Record<string, string> = {
  essential: "REBUILD Esențial (199€)",
  premium: "REBUILD Premium (299€)",
  coaching: "CYB Coaching Complet (499€)",
};

function errorPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Change Your Body</title></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:80px 20px;text-align:center;">
    <h1 style="color:#C9A84C;font-size:24px;margin:0 0 16px;">Change Your Body</h1>
    <div style="background:#141e29;border-radius:16px;padding:32px 24px;border:1px solid rgba(201,168,76,0.15);">
      <p style="color:#e0e0e0;font-size:16px;font-weight:600;margin:0 0 12px;">${title}</p>
      <p style="color:#888;font-size:14px;line-height:1.7;margin:0;">${message}</p>
    </div>
    <p style="color:#444;font-size:11px;margin-top:20px;">changeyourbody.ro</p>
  </div>
</body>
</html>`;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ sid?: string }>;
}) {
  const { sid } = await searchParams;

  // Guard: no session ID
  if (!sid) {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Link invalid",
              "Acest link nu conține un identificator valid. Verifică email-ul primit după plată."
            ),
          }}
        />
      </html>
    );
  }

  // Guard: Stripe not configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Serviciu indisponibil",
              "Raportul nu poate fi generat momentan. Te rugăm să încerci mai târziu."
            ),
          }}
        />
      </html>
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  // Fetch session from Stripe
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sid);
  } catch {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Raport negăsit",
              "Sesiunea de plată nu a fost găsită. Verifică link-ul din email."
            ),
          }}
        />
      </html>
    );
  }

  // Guard: must be fulfilled
  if (session.metadata?.cyb_fulfilled !== "true") {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Raport indisponibil",
              "Raportul va fi disponibil după confirmarea plății. Dacă ai plătit deja, așteaptă câteva minute și reîncearcă."
            ),
          }}
        />
      </html>
    );
  }

  // Guard: Essential only (for now)
  const packageId = session.metadata?.packageId || "";
  if (packageId !== "essential") {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Raport indisponibil",
              "Raportul online este disponibil momentan doar pentru pachetul Essential. Daniela te va contacta cu raportul tău complet."
            ),
          }}
        />
      </html>
    );
  }

  // Extract profile from session metadata
  const profile = extractProfile(session.metadata);
  if (!profile) {
    return (
      <html>
        <body
          dangerouslySetInnerHTML={{
            __html: errorPage(
              "Date insuficiente",
              "Profilul tău nu conține suficiente date pentru a genera raportul. Contactează-ne pe WhatsApp."
            ),
          }}
        />
      </html>
    );
  }

  // Generate the report
  const customerName =
    session.metadata?.customerName ||
    session.customer_details?.name ||
    "";
  const packageName = PACKAGE_NAMES[packageId] || "REBUILD Esențial";

  const reportHtml = buildMetabolicReportHtml({
    customerName,
    packageName,
    profile,
    mode: "browser",
  });

  return (
    <html>
      <body dangerouslySetInnerHTML={{ __html: reportHtml }} />
    </html>
  );
}
