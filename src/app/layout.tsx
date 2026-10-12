import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BirthdayMagic - Happy Birthday Website Generator & Personalized Surprise Gifts",
  description: "Create breathtaking personalized birthday surprise websites with music, photos, animated gift boxes, cakes with blow-out candles, and heartfelt memories. Share via WhatsApp or unique link instantly!",
  keywords: ["birthday website generator", "birthday surprise", "happy birthday wishes", "personalized birthday gift", "interactive birthday card"],
  openGraph: {
    title: "BirthdayMagic - Create a Personalized Birthday Surprise Website",
    description: "Gift someone an unforgettable digital birthday experience with photos, music, cake & animations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Fredoka:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
