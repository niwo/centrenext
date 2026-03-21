import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Dancing_Script, Manrope } from "next/font/google";

import "@/app/globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Centre Bien-Etre 2.0",
  description: "Mehrsprachige Landing Page fuer eine moderne Physiotherapiepraxis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${cormorant.variable} ${dancingScript.variable} bg-sand text-ink antialiased`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const key = "centrenext-theme";
            const saved = localStorage.getItem(key);
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const theme = saved === "light" || saved === "dark" ? saved : (prefersDark ? "dark" : "light");
            document.documentElement.classList.toggle("dark", theme === "dark");
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}