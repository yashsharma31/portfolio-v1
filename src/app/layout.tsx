import "./globals.css";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/Navbar";
import GrainOverlay from "@/components/GrainOverlay";
import EmberFieldMount from "@/components/background/EmberFieldMount";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { metadata } from "./metadata";
import { CONTACT_LINKS } from "@/utils/constants";

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <EmberFieldMount />
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Yash Sharma",
              url: "https://sharmayash.com",
              image: "/images/profile.jpeg",
              sameAs: [
                CONTACT_LINKS.github,
                CONTACT_LINKS.linkedin,
                CONTACT_LINKS.twitter,
              ],
              jobTitle: "Software Development Engineer II",
              worksFor: {
                "@type": "Organization",
                name: "Trential",
              },
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "Bennett University",
              },
              description:
                "Software Development Engineer II building secure wallets, evaluation platforms, and WebGL canvas editors.",
              knowsAbout: [
                "Web Development",
                "React",
                "React Native",
                "Next.js",
                "TypeScript",
                "WebGL",
                "Pixi.js",
                "GSAP",
                "Motion",
              ],
            }),
          }}
        />
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-page"
          style={{ zIndex: "var(--z-overlay)" }}
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Navbar />
        <main className="relative" style={{ zIndex: "var(--z-content)" }}>
          {children}
        </main>
        <GrainOverlay />
        <Analytics />
      </body>
    </html>
  );
}
