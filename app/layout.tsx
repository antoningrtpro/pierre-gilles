import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pierre G. — Photographie naturaliste",
    template: "%s | Pierre G.",
  },
  description:
    "La nature dans ses instants les plus silencieux. Photographie naturaliste par Pierre G.",
  openGraph: {
    siteName: "Pierre G. Photography",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
