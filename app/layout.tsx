import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HiddyStays - Premium Zero-Fee Stays",
  description:
    "Experience luxury accommodations without hidden fees. Connect directly with hosts, save money, and enjoy authentic hospitality with HiddyStays.",
  keywords:
    "premium stays, zero fees, direct booking, luxury accommodations, authentic hospitality, vacation rental",
  authors: [{ name: "HiddyStays Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="zerofee-theme"
        >
          <ErrorBoundary>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ErrorBoundary>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
