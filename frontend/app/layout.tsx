import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Queue Cure '26 — Real-Time Queue Management",
  description:
    "Queue Cure '26 is a real-time patient queue management system for clinics and hospitals. Receptionists manage the queue; patients track their wait time live.",
  keywords: ["queue management", "hospital queue", "patient queue", "real-time queue"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#080c14] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
