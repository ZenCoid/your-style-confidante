import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "flaunt.fit — Your AI Stylist",
  description: "An honest second opinion on your outfit, before you leave the house. AI-powered fashion advice that sounds like a friend texting you back.",
  keywords: ["fashion", "AI", "stylist", "outfit", "style", "advice"],
  openGraph: {
    title: "flaunt.fit — Your AI Stylist",
    description: "Don't rate. Match. Get honest outfit feedback from an AI that sounds like your stylish friend.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "flaunt.fit",
    description: "Your AI Stylist",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
