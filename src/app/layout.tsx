import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Mis Gastos - Control de Gastos Mensuales",
  description: "Aplicación para el seguimiento y control de gastos mensuales del hogar. Registra, gestiona y analiza tus gastos de forma sencilla.",
  keywords: ["gastos", "finanzas", "presupuesto", "hogar", "control de gastos"],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://misgastos.app",
    siteName: "Mis Gastos",
    title: "Mis Gastos - Control Inteligente de Gastos",
    description: "Gestiona tus gastos mensuales de forma fácil y eficiente. Seguimiento de pagos, presupuestos y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mis Gastos - Dashboard de Control Financiero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mis Gastos - Control Inteligente de Gastos",
    description: "Gestiona tus gastos mensuales de forma fácil y eficiente",
    images: ["/og-image.png"],
    creator: "@misgastosapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground overflow-hidden h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
