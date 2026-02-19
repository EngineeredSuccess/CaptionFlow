import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/shared/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CaptionFlow - AI Social Media Caption Generator",
  description: "Generate engaging social media captions with AI. Train on your brand voice for authentic results. 75% cheaper than EasyGen.",
  verification: {
    other: {
      "tiktok-developers-site-verification": "vZ1Crc4v9o2R9anjclQLemXhJqoyQQsF",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
