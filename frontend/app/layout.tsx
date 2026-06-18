import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoReport AI",
  description: "Gouvernance urbaine participative",
  manifest: "/manifest.json", // Active la PWA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3043/3043511.png" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}