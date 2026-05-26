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
