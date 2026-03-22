import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mulțumim! — Change Your Body",
  description: "Plata a fost procesată cu succes.",
};

export default function CheckoutSuccessPage() {
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
        <div
          style={{
            fontSize: "3rem",
            marginBottom: 16,
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.8rem",
            color: "white",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Mulțumim pentru încredere!
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.8,
            marginBottom: 24,
          }}
        >
          Plata ta a fost procesată cu succes. Daniela va pregăti planul tău
          personalizat și te va contacta în maximum 24 de ore.
        </p>

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
            {[
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
            ].map((item) => (
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
          href="https://wa.me/40721333040?text=Bun%C4%83%20Daniela,%20tocmai%20am%20finalizat%20plata%20și%20am%20o%20întrebare."
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
