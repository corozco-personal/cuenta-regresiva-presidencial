import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuenta pública | Periodo presidencial 2026–2030",
  description: "Cuenta regresiva y archivo documental del periodo presidencial de Colombia.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
