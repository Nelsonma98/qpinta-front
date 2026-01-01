import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
            <a href="/admin/login" className="login-button" aria-label="Ir al login">
              <svg
                className="login-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                <path d="M5 20.5c0-3.038 3.134-5 7-5s7 1.962 7 5" />
              </svg>
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
