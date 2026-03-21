import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Dancing_Script, Manrope } from "next/font/google";

import "@/app/globals.css";
import { getBaseUrl, getRootLanguageAlternates, toAbsoluteUrl } from "@/lib/seo";

const defaultSeoDescription = "Die Praxis fuer das ganzheitliche Wohlbefinden. Angebote: Physiotherapie, Coaching und Rehabilitation.";

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
  metadataBase: getBaseUrl(),
  title: {
    default: "Centre bien-etre",
    template: "%s | Centre bien-etre",
  },
  description: defaultSeoDescription,
  keywords: ["Physiotherapie", "Biel", "Bienne", "Centre bien-etre", "Angebote", "Team", "Kontakt"],
  alternates: {
    canonical: "/",
    languages: getRootLanguageAlternates(),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Centre bien-etre",
    title: "Centre bien-etre",
    description: defaultSeoDescription,
    images: [{ url: toAbsoluteUrl("/images/DSC06768.jpg") }],
    locale: "de_CH",
    alternateLocale: ["fr_CH"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Centre bien-etre",
    description: defaultSeoDescription,
    images: [toAbsoluteUrl("/images/DSC06768.jpg")],
  },
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

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

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
        {umamiScriptUrl && umamiWebsiteId ? (
          <Script
            defer
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}