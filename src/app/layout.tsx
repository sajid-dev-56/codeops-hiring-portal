import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring Portal — Find Your Next Career Opportunity",
  description:
    "Browse open positions and apply to join our team. We're looking for talented individuals who are passionate about building great products.",
  keywords: ["careers", "jobs", "hiring", "apply", "work with us"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-50 text-surface-900 min-h-screen" suppressHydrationWarning>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
