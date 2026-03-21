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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
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