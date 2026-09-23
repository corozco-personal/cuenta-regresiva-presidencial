import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "./components/analytics-tracker";
import PwaRegister from "./components/pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site"),
  title: {
    default: "Tiempo restante para que el presidente Abelardo Gabriel De La Espriella Otero deje la presidencia",
    template: "%s · Cuenta pública",
  },
  description: "Cuenta regresiva, radar mundial de medios y archivo documental del periodo presidencial de Colombia. Proyecto creado por Carlos Orozco.",
  authors: [{ name: "Carlos Orozco", url: "/autor" }],
  creator: "Carlos Orozco",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Cuenta pública",
    title: "Cuenta pública",
    description: "Seguimiento documental del periodo presidencial. Un proyecto de Carlos Orozco.",
    url: "/",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "Cuenta pública, un proyecto de Carlos Orozco" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuenta pública",
    description: "Seguimiento documental del periodo presidencial. Un proyecto de Carlos Orozco.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}<AnalyticsTracker /><PwaRegister /></body>
    </html>
  );
}
