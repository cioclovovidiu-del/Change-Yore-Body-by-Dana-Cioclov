import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Change Your Body — Daniela Cioclov",
  description:
    "Chestionar personalizat de fitness și nutriție pentru femei 35+.",
  metadataBase: new URL("https://change-your-body.vercel.app"),
  openGraph: {
    title: "Change Your Body — Daniela Cioclov",
    description:
      "Chestionar personalizat de fitness și nutriție pentru femei 35+.",
    siteName: "Change Your Body",
    locale: "ro_RO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${serif.variable} ${sans.variable} antialiased`}>{children}</body>
    </html>
  );
}
