// Shared minimal inline styles for questionnaire step components.
// Mirrors key design tokens from CYB_Chestionar_Unified.html CSS.

export const colors = {
  teal: "#2AA5A0",
  tealGlow: "#3ECDC6",
  tealDark: "#157575",
  gold: "#C9A84C",
  goldWarm: "#D4AF37",
  dark: "#0F1923",
  dark2: "#1A2733",
  dark3: "#243442",
  text: "rgba(255,255,255,0.55)",
  white: "#F8FAFC",
  green: "#48BB78",
} as const;

export const slide: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  padding: "32px 24px 140px",
};

export const qLabel: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: colors.tealGlow,
  marginBottom: 6,
};

export const qTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "1.4rem",
  color: "white",
  lineHeight: 1.3,
  marginBottom: 6,
  fontWeight: 600,
};

export const qSub: React.CSSProperties = {
  fontSize: "0.82rem",
  color: colors.text,
  marginBottom: 20,
  lineHeight: 1.6,
};

export const textInput: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 12,
  border: "1.5px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: "1rem",
  outline: "none",
};

export const numberInput: React.CSSProperties = {
  ...textInput,
  textAlign: "center",
  fontSize: "1.6rem",
  fontWeight: 600,
  maxWidth: 160,
  margin: "0 auto",
  display: "block",
};

export const emailInput: React.CSSProperties = {
  ...textInput,
  marginBottom: 16,
};

export const emoMsg: React.CSSProperties = {
  marginTop: 20,
  padding: "14px 18px",
  borderRadius: 12,
  background: "rgba(42,165,160,0.06)",
  border: "1px solid rgba(42,165,160,0.1)",
  fontSize: "0.85rem",
  color: colors.tealGlow,
  fontStyle: "italic",
  lineHeight: 1.7,
};
