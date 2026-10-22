import type { Metadata, Viewport } from "next";
import { Big_Shoulders } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Headline face: Wajeeh's pick from design/font-board.html (the right one, Big Shoulders).
const display = Big_Shoulders({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

// Body: Janobi's own Lab Grotesque (web licence confirmed by Wajeeh, 2026-10-16).
const body = localFont({
  variable: "--font-body-face",
  display: "swap",
  src: [
    { path: "./fonts/LabGrotesque-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/LabGrotesque-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/LabGrotesque-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sports.janobi.agency"),
  title: "Free Personal Brand Audit for Athletes | Janobi Sports",
  description:
    "A free 2-minute audit for fighters, footballers, cricketers and other athletes. Get your Personal Brand Score now, then we review your real profiles and bring 3 fixes to a 20-minute call.",
  openGraph: {
    title: "Free Personal Brand Audit for Athletes",
    description: "Get your score in 2 minutes. Janobi Sports, UK and US.",
    images: ["/img/hero-1.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#f3f0e8" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: some mobile browsers inject attributes on <html>.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
