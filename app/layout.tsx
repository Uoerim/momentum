import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "./Navigation";
import NavigationPopup from "./NavigationPopup";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Momentum",
  description: "A modern portfolio experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        <div className="main">
          <NavigationPopup />
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
