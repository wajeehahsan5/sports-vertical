import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";

// Headline face: Wajeeh's pick from design/font-board.html (Barlow Condensed until he says otherwise).
const display = Barlow_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

// Body: DM Sans until the Lab Grotesque web licence is confirmed (then swap to next/font/local).
const body = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sports.janobi.agency"),
  title: "Free Personal Brand Audit for Athletes | Janobi Sports",
  description:
    "A free 2-minute audit for athletes and fighters. Get your Personal Brand Score now, then we review your real profiles and bring 3 fixes to a 20-minute call.",
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
