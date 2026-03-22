import type { Metadata } from "next";
import Stripe from "stripe";

// ── C8+C12: Package-aware success page with delivery guidance ────────
// Reads session_id from Stripe redirect to show package-specific messaging.
// Essential: links to C7 browser report. Premium/Coaching: honest manual timeline.
// C12: email verification guidance, missing-email fallback, customer email display.
// Graceful fallback: if Stripe unavailable, shows generic success (C1 behavior).

export const metadata: Metadata = {
  title: "Mulțumim! — Change Your Body",
  description: "Plata a fost procesată cu succes.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ── Package display info ───────────────────────────────────────────
const PACKAGE_DISPLAY: Record<
  string,
  { label: string; emoji: string }
> = {
  essential: { label: "REBUILD Esențial", emoji: "📊" },
  premium: { label: "REBUILD Premium", emoji: "⭐" },
  coaching: { label: "CYB Coaching Complet", emoji: "🏋️" },
};

// ── Stripe session fetch (safe: returns null on any failure) ───────
async function getSessionInfo(sessionId: string): Promise<{
  packageId: string;
  customerName: string;
  customerEmail: string;
  fulfilled: boolean;
} | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      packageId: session.metadata?.packageId || "",
      customerName:
        session.metadata?.customerName ||
        session.customer_details?.name ||
        "",
      customerEmail:
        session.metadata?.customerEmail ||
        session.customer_details?.email ||
        "",
      fulfilled: session.metadata?.cyb_fulfilled === "true",
    };
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const info = session_id ? await getSessionInfo(session_id) : null;

  // Resolve package-aware data (fallback to generic if unavailable)
  const packageId = info?.packageId || "";
  const pkgDisplay = PACKAGE_DISPLAY[packageId] || null;
  const firstName = info?.customerName?.split(" ")[0] || "";
  const customerEmail = info?.customerEmail || "";
  const isEssential = packageId === "essential";
  const isFulfilled = info?.fulfilled === true;

  // Build "Ce urmează" steps based on package
  const steps = buildSteps(packageId, isFulfilled);

  // WhatsApp message — package-aware if known
  const waMessage = pkgDisplay
    ? `Bună Daniela, tocmai am achiziționat ${pkgDisplay.label} și am o întrebare.`
    : "Bună Daniela, tocmai am finalizat plata și am o întrebare.";
  const waUrl = `https://wa.me/40721333040?text=${encodeURIComponent(waMessage)}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F1923",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          padding: "40px 28px",
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(42,165,160,0.06), rgba(201,168,76,0.04))",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        {/* ── C12: Title + Intro ─────────────────────────────── */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.8rem",
            color: "white",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Plata a fost confirmată ✅
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {firstName
            ? `Îți mulțumim, ${firstName}! Totul este pregătit.`
            : "Îți mulțumim! Totul este pregătit."}
        </p>
        {pkgDisplay && (
          <p
            style={{
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 24,
            }}
          >
            Pachetul{" "}
            <strong style={{ color: "#C9A84C" }}>{pkgDisplay.label}</strong>{" "}
            este acum activ.
          </p>
        )}
        {!pkgDisplay && <div style={{ marginBottom: 24 }} />}

        {/* ── C12: Email verification section ─────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            padding: "20px 20px",
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: "#C9A84C",
              fontWeight: 600,
              margin: "0 0 10px",
            }}
          >
            📩 Verifică emailul
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              margin: "0 0 10px",
            }}
          >
            Ți-am trimis toate detaliile pe emailul introdus în comandă.
            {customerEmail && (
              <>
                <br />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                  Emailul tău:{" "}
                  <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                    {customerEmail}
                  </strong>
                </span>
              </>
            )}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Te rugăm să verifici: <strong style={{ color: "rgba(255,255,255,0.6)" }}>Inbox</strong>
            {" · "}
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>Spam / Promotions</strong>
          </p>
        </div>

        {/* ── C12: Missing email fallback ─────────────────── */}
        <div
          style={{
            background: "rgba(201,168,76,0.05)",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            border: "1px solid rgba(201,168,76,0.12)",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            ❗ <strong style={{ color: "rgba(255,255,255,0.7)" }}>Nu ai primit emailul?</strong>
            <br />
            Dacă nu îl vezi în 2–3 minute, scrie-ne direct pe WhatsApp și
            îți trimitem imediat:
            <br />
            <a
              href="https://wa.me/40721333040?text=Salut%20Daniela%2C%20tocmai%20am%20pl%C4%83tit%20dar%20nu%20am%20primit%20emailul%20de%20confirmare."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#25D366",
                fontWeight: 600,
                textDecoration: "underline",
                fontSize: "0.82rem",
              }}
            >
              Scrie pe WhatsApp →
            </a>
          </p>
        </div>

        {/* ── C8: Essential report CTA (C7 reuse) ──────────── */}
        {isEssential && session_id && (
          <div
            style={{
              background: "rgba(42,165,160,0.08)",
              borderRadius: 14,
              padding: "20px 20px",
              marginBottom: 20,
              border: "1px solid rgba(42,165,160,0.18)",
            }}
          >
            <p
              style={{
                fontSize: "0.88rem",
                color: "#2AA5A0",
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              📊 Raportul tău metabolic personalizat
            </p>
            {isFulfilled ? (
              <>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                  }}
                >
                  Raportul este gata! Include analiza BMI, BMR, TDEE și
                  recomandări personalizate.
                </p>
                <a
                  href={`/report?sid=${encodeURIComponent(session_id)}`}
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #2AA5A0, #1d8a86)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Deschide raportul →
                </a>
              </>
            ) : (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Raportul se generează automat și va fi disponibil în
                câteva minute. Vei primi un link și pe email.
                <br />
                <a
                  href={`/report?sid=${encodeURIComponent(session_id)}`}
                  style={{
                    color: "#2AA5A0",
                    textDecoration: "underline",
                    fontSize: "0.8rem",
                  }}
                >
                  Verifică disponibilitatea →
                </a>
              </p>
            )}
          </div>
        )}

        {/* ── Ce urmează steps ─────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "20px 16px",
            marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              color: "#C9A84C",
              fontWeight: 600,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Ce urmează
          </h3>
          <div style={{ textAlign: "left" }}>
            {steps.map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(42,165,160,0.15)",
                    color: "#2AA5A0",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {item.step}
                </span>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WhatsApp CTA ─────────────────────────────────── */}
        <p
          style={{
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 20,
          }}
        >
          Ai întrebări? Scrie-i Danielei direct:
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 10,
            background: "rgba(37,211,102,0.15)",
            color: "#25D366",
            fontSize: "0.88rem",
            fontWeight: 600,
            textDecoration: "none",
            border: "1px solid rgba(37,211,102,0.2)",
            transition: "background 0.2s",
          }}
        >
          Scrie pe WhatsApp →
        </a>

        {/* ── Back link ────────────────────────────────────── */}
        <div style={{ marginTop: 24 }}>
          <a
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)",
              textDecoration: "underline",
            }}
          >
            ← Înapoi la pagina principală
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Package-aware step builder ─────────────────────────────────────
function buildSteps(
  packageId: string,
  isFulfilled: boolean
): { step: string; text: string }[] {
  if (packageId === "essential") {
    return [
      {
        step: "1",
        text: "Primești un email de confirmare cu detaliile comenzii",
      },
      {
        step: "2",
        text: isFulfilled
          ? "Raportul tău metabolic personalizat este gata (vezi mai sus)"
          : "Raportul tău metabolic se generează automat (câteva minute)",
      },
      {
        step: "3",
        text: "Daniela analizează profilul tău și pregătește planul complet (24h)",
      },
      {
        step: "4",
        text: "Primești planul personalizat: nutriție + antrenament",
      },
    ];
  }

  if (packageId === "premium") {
    return [
      {
        step: "1",
        text: "Primești un email de confirmare cu detaliile comenzii",
      },
      {
        step: "2",
        text: "Daniela analizează profilul tău complet (24h)",
      },
      {
        step: "3",
        text: "Primești planul premium personalizat: nutriție + antrenament + raport detaliat",
      },
      {
        step: "4",
        text: "Începi transformarea cu suport dedicat",
      },
    ];
  }

  if (packageId === "coaching") {
    return [
      {
        step: "1",
        text: "Primești un email de confirmare cu detaliile comenzii",
      },
      {
        step: "2",
        text: "Daniela te contactează personal pentru programarea primei sesiuni",
      },
      {
        step: "3",
        text: "Primești planul complet + acces la coaching 1-la-1",
      },
      {
        step: "4",
        text: "Începi transformarea cu Daniela alături de tine la fiecare pas",
      },
    ];
  }

  // Generic fallback (no package info available)
  return [
    {
      step: "1",
      text: "Primești un email de confirmare cu detaliile comenzii",
    },
    {
      step: "2",
      text: "Daniela analizează profilul tău complet (24h)",
    },
    {
      step: "3",
      text: "Primești planul personalizat: nutriție + antrenament + raport",
    },
    {
      step: "4",
      text: "Începi transformarea cu suport dedicat",
    },
  ];
}
