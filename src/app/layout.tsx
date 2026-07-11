import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://codeopspro.vercel.app"),
  title: {
    default: "CodeOps Hiring Portal",
    template: "%s | CodeOps Hiring Portal",
  },
  description:
    "Browse open positions and apply to join our team. We're looking for talented individuals who are passionate about building great products.",
  keywords: ["careers", "jobs", "hiring", "apply", "work with us", "CodeOps Pro"],
  openGraph: {
    title: "CodeOps Hiring Portal",
    description: "Browse open positions and apply to join our team.",
    url: "https://codeopspro.vercel.app",
    siteName: "CodeOps Pro",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeOps Hiring Portal",
    description: "Browse open positions and apply to join our team.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 min-h-screen transition-colors duration-300`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
