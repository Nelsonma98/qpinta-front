import type { Metadata } from "next";
import Link from "next/link";
import NavMenu from "@/components/NavMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q`Pinta",
  description: "Catálogo digital de tienda de ropa de segunda mano",
  icons: {
    icon: "/mini-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="navbar">
            <Link href="/" className="logo-link" aria-label="Ir a inicio">
              <img src="/logo-qpinta.png" alt="Logo" className="logo" />
            </Link>
            <NavMenu />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
