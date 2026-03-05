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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Change Your Body — Daniela Cioclov",
    description:
      "Chestionar personalizat de fitness și nutriție pentru femei 35+.",
    url: "https://change-your-body.vercel.app",
    siteName: "Change Your Body",
    images: [
      {
        url: "https://change-your-body.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dana Cioclov — Change Your Body",
      },
    ],
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
